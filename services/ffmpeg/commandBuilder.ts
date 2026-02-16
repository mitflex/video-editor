/**
 * ============================================================
 *  COMMAND BUILDER
 *  Fluent API for constructing FFmpeg command strings.
 *  Collects all editing operations and compiles them into
 *  a single FFmpeg command for one-pass rendering.
 *
 *  Usage:
 *    const cmd = new CommandBuilder()
 *      .input('/path/to/video.mp4')
 *      .trim(1000, 5000)
 *      .crop({ x: 0, y: 0, width: 720, height: 1280 })
 *      .speed(2)
 *      .filter('warm')
 *      .setResolution(1080, 1920)
 *      .setCodec('libx264', 'aac')
 *      .output('/path/to/output.mp4')
 *      .build();
 * ============================================================
 */

import { ADJUSTMENT_RANGES } from '@/constants/filters';
import type { AdjustmentValues, CropRect } from '@/types/video';

// ─── Text Overlay Options ───────────────────────────────────
/** Options for a drawtext filter */
export interface TextOverlayOptions {
  text: string;
  /** X position in pixels */
  x: number;
  /** Y position in pixels */
  y: number;
  fontSize: number;
  /** Hex color (e.g., '#FFFFFF') */
  color: string;
  /** Path to font file (optional — uses default if omitted) */
  fontFile?: string;
}

// ─── Command Builder ────────────────────────────────────────

export class CommandBuilder {
  private inputPath = '';
  private outputPath = '';
  private videoFilters: string[] = [];
  private audioFilters: string[] = [];
  private additionalInputs: string[] = [];
  private preInputArgs: string[] = [];
  private postInputArgs: string[] = [];
  private codecArgs: string[] = [];
  private hasSpeedChange = false;
  private speedMultiplier = 1;
  private hasMixedAudio = false;

  // ─── Input / Output ─────────────────────────────────────

  /** Sets the primary input file */
  input(uri: string): this {
    this.inputPath = uri;
    return this;
  }

  /** Sets the output file path */
  output(uri: string): this {
    this.outputPath = uri;
    return this;
  }

  // ─── Trim ────────────────────────────────────────────────

  /**
   * Trims the video to a time range.
   * Uses input-level seeking (-ss/-to) for fast, frame-accurate results.
   */
  trim(startMs: number, endMs: number): this {
    const startSec = msToSeconds(startMs);
    const endSec = msToSeconds(endMs);
    this.preInputArgs.push(`-ss ${startSec}`, `-to ${endSec}`);
    return this;
  }

  // ─── Transform ───────────────────────────────────────────

  /** Crops the video to a rectangle */
  crop(rect: CropRect): this {
    this.videoFilters.push(
      `crop=${rect.width}:${rect.height}:${rect.x}:${rect.y}`,
    );
    return this;
  }

  /**
   * Rotates the video by the specified degrees.
   * FFmpeg transpose: 1=90CW, 2=90CCW, 0=90CCW+vflip, 3=90CW+vflip
   */
  rotate(degrees: 0 | 90 | 180 | 270): this {
    switch (degrees) {
      case 90:
        this.videoFilters.push('transpose=1');
        break;
      case 180:
        this.videoFilters.push('transpose=1,transpose=1');
        break;
      case 270:
        this.videoFilters.push('transpose=2');
        break;
      // 0 = no rotation
    }
    return this;
  }

  /** Flips the video horizontally and/or vertically */
  flip(horizontal: boolean, vertical: boolean): this {
    if (horizontal) this.videoFilters.push('hflip');
    if (vertical) this.videoFilters.push('vflip');
    return this;
  }

  /**
   * Changes playback speed.
   * Video: setpts=PTS/multiplier
   * Audio: atempo (chained for values outside 0.5-2.0 range)
   */
  speed(multiplier: number): this {
    if (multiplier === 1) return this;

    this.hasSpeedChange = true;
    this.speedMultiplier = multiplier;

    // Video speed: setpts=PTS/multiplier (inverse because lower PTS = faster)
    this.videoFilters.push(`setpts=PTS/${multiplier}`);

    // Audio speed: atempo filter (valid range per instance: 0.5-2.0)
    const atempoChain = buildAtempoChain(multiplier);
    this.audioFilters.push(atempoChain);

    return this;
  }

  // ─── Filters & Adjustments ──────────────────────────────

  /**
   * Applies a raw FFmpeg video filter string.
   * Used for color filter presets from constants/filters.ts.
   */
  filter(ffmpegFilterString: string): this {
    if (ffmpegFilterString) {
      this.videoFilters.push(ffmpegFilterString);
    }
    return this;
  }

  /**
   * Applies brightness/contrast/saturation adjustments.
   * Converts UI values (-100..100) to FFmpeg eq filter values
   * using ADJUSTMENT_RANGES converters.
   */
  adjustments(values: AdjustmentValues): this {
    const b = ADJUSTMENT_RANGES.brightness.toFFmpeg(values.brightness);
    const c = ADJUSTMENT_RANGES.contrast.toFFmpeg(values.contrast);
    const s = ADJUSTMENT_RANGES.saturation.toFFmpeg(values.saturation);

    // Only add the eq filter if any value differs from default
    const isDefault = b === 0 && c === 1 && s === 1;
    if (!isDefault) {
      this.videoFilters.push(`eq=brightness=${b}:contrast=${c}:saturation=${s}`);
    }

    return this;
  }

  // ─── Text Overlay ───────────────────────────────────────

  /** Adds a text overlay using the drawtext filter */
  overlayText(options: TextOverlayOptions): this {
    const escapedText = escapeFFmpegText(options.text);
    const color = hexToFFmpegColor(options.color);

    let drawtext = `drawtext=text='${escapedText}':x=${options.x}:y=${options.y}:fontsize=${options.fontSize}:fontcolor=${color}`;

    if (options.fontFile) {
      drawtext += `:fontfile='${options.fontFile}'`;
    }

    this.videoFilters.push(drawtext);
    return this;
  }

  // ─── Audio ──────────────────────────────────────────────

  /**
   * Mixes the original video audio with a background music track.
   * Uses filter_complex with amix for multi-input audio mixing.
   *
   * @param bgMusicUri Path to the background music file.
   * @param originalVolume Volume for original audio (0-100).
   * @param musicVolume Volume for background music (0-100).
   */
  mixAudio(
    bgMusicUri: string,
    originalVolume: number,
    musicVolume: number,
  ): this {
    this.additionalInputs.push(bgMusicUri);
    this.hasMixedAudio = true;

    const origVol = originalVolume / 100;
    const musicVol = musicVolume / 100;

    // Audio filter graph for mixing two audio inputs
    // [0:a] = original video audio, [1:a] = background music
    this.audioFilters.push(
      `[0:a]volume=${origVol}[a0];[1:a]volume=${musicVol}[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2`,
    );

    return this;
  }

  /**
   * Mixes the original video audio with a voiceover track.
   * @param voiceoverUri Path to the voiceover audio file.
   * @param originalVolume Volume for original audio (0-100).
   * @param voiceoverVolume Volume for voiceover (0-100).
   */
  mixVoiceover(
    voiceoverUri: string,
    originalVolume: number,
    voiceoverVolume: number,
  ): this {
    this.additionalInputs.push(voiceoverUri);
    this.hasMixedAudio = true;

    const origVol = originalVolume / 100;
    const voVol = voiceoverVolume / 100;

    this.audioFilters.push(
      `[0:a]volume=${origVol}[a0];[${this.additionalInputs.length}:a]volume=${voVol}[a1];[a0][a1]amix=inputs=2:duration=first:dropout_transition=2`,
    );

    return this;
  }

  /** Strips all audio from the output */
  muteAudio(): this {
    this.postInputArgs.push('-an');
    return this;
  }

  /** Sets the volume of the original audio track (0-100) */
  volume(volumePercent: number): this {
    const vol = volumePercent / 100;
    this.audioFilters.push(`volume=${vol}`);
    return this;
  }

  // ─── Output Options ─────────────────────────────────────

  /** Sets the output resolution (width x height) */
  setResolution(width: number, height: number): this {
    // scale filter with even dimensions enforced
    this.videoFilters.push(
      `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2`,
    );
    return this;
  }

  /** Sets the video and audio codecs */
  setCodec(videoCodec: string, audioCodec: string): this {
    this.codecArgs.push(`-c:v ${videoCodec}`, `-c:a ${audioCodec}`);
    return this;
  }

  // ─── Build ──────────────────────────────────────────────

  /**
   * Builds and returns the complete FFmpeg command string.
   * The command does NOT include the leading `ffmpeg` — it starts with flags.
   */
  build(): string {
    const parts: string[] = [];

    // Overwrite output
    parts.push('-y');

    // Pre-input args (e.g., -ss, -to for seeking)
    parts.push(...this.preInputArgs);

    // Primary input
    parts.push(`-i "${this.inputPath}"`);

    // Additional inputs (background music, voiceover)
    for (const input of this.additionalInputs) {
      parts.push(`-i "${input}"`);
    }

    // Build filter arguments
    if (this.hasMixedAudio) {
      // Use -filter_complex when we have multi-input audio mixing
      const filterComplex = this.buildFilterComplex();
      if (filterComplex) {
        parts.push(`-filter_complex "${filterComplex}"`);
      }
    } else {
      // Simple case: separate -vf and -af
      if (this.videoFilters.length > 0) {
        parts.push(`-vf "${this.videoFilters.join(',')}"`);
      }
      if (this.audioFilters.length > 0) {
        parts.push(`-af "${this.audioFilters.join(',')}"`);
      }
    }

    // Post-input args (e.g., -an for mute)
    parts.push(...this.postInputArgs);

    // Codec settings
    if (this.codecArgs.length > 0) {
      parts.push(...this.codecArgs);
    }

    // Output path
    parts.push(`"${this.outputPath}"`);

    return parts.join(' ');
  }

  // ─── Internal ───────────────────────────────────────────

  /**
   * Builds a -filter_complex string when we have multi-input audio.
   * Handles combining video filters with audio mixing graphs.
   */
  private buildFilterComplex(): string {
    const graphParts: string[] = [];

    // Video filter chain (applied to input 0 video stream)
    if (this.videoFilters.length > 0) {
      graphParts.push(`[0:v]${this.videoFilters.join(',')}[vout]`);
    }

    // Audio filter graph (already includes stream labels from mixAudio/mixVoiceover)
    for (const af of this.audioFilters) {
      graphParts.push(af);
    }

    return graphParts.join(';');
  }
}

// ─── Helpers ────────────────────────────────────────────────

/** Converts milliseconds to seconds string with 3 decimal places */
function msToSeconds(ms: number): string {
  return (ms / 1000).toFixed(3);
}

/**
 * Builds a chain of atempo filters for the given speed multiplier.
 * Each atempo instance supports 0.5-2.0 range, so values outside
 * that range need chaining (e.g., 4x = atempo=2.0,atempo=2.0).
 */
function buildAtempoChain(multiplier: number): string {
  const parts: string[] = [];
  let remaining = multiplier;

  if (multiplier > 1) {
    // Speed up: chain atempo=2.0 until remaining < 2.0
    while (remaining > 2.0) {
      parts.push('atempo=2.0');
      remaining /= 2.0;
    }
    parts.push(`atempo=${remaining}`);
  } else {
    // Slow down: chain atempo=0.5 until remaining > 0.5
    while (remaining < 0.5) {
      parts.push('atempo=0.5');
      remaining /= 0.5;
    }
    parts.push(`atempo=${remaining}`);
  }

  return parts.join(',');
}

/** Escapes special characters for FFmpeg drawtext filter */
function escapeFFmpegText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/%/g, '%%');
}

/** Converts a hex color string to FFmpeg-compatible format */
function hexToFFmpegColor(hex: string): string {
  // FFmpeg accepts hex colors without the # prefix, prefixed with 0x
  // Or it accepts color names. Let's use the hex format FFmpeg expects.
  if (hex.startsWith('#')) {
    return `0x${hex.slice(1)}`;
  }
  return hex;
}
