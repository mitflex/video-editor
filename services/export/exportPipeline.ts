/**
 * ============================================================
 *  EXPORT PIPELINE
 *  Orchestrates the final video export by collecting all
 *  editing state and producing a single-pass FFmpeg render.
 *
 *  Flow:
 *    1. Collect all editing params
 *    2. Build a single FFmpeg command via CommandBuilder
 *    3. Save a crash-recovery checkpoint
 *    4. Execute the command with progress tracking
 *    5. On success: clear checkpoint, return result
 *    6. On failure: preserve checkpoint for retry
 * ============================================================
 */

import { FILTER_PRESETS } from '@/constants/filters';
import { CommandBuilder } from '@/services/ffmpeg/commandBuilder';
import type { TextOverlayOptions } from '@/services/ffmpeg/commandBuilder';
import {
  executeCommand,
  cancelExecution,
} from '@/services/ffmpeg/ffmpegService';
import type { FFmpegProgress } from '@/services/ffmpeg/types';
import {
  createOutputFile,
  getFileSize,
} from '@/services/file/fileService';
import type {
  AdjustmentValues,
  AudioConfig,
  ExportConfig,
  ExportResult,
  TrimRange,
  VideoTransform,
} from '@/types/video';
import { EXPORT_RESOLUTIONS } from '@/types/video';
import type { TextOverlay } from '@/types/overlay';

import {
  saveCheckpoint,
  clearCheckpoint,
} from './exportRecovery';

// ─── Export Params ──────────────────────────────────────────

/** All editing state needed to produce the final export */
export interface ExportParams {
  /** Path to the original source video */
  sourceUri: string;
  /** Source video duration in milliseconds */
  sourceDurationMs: number;
  /** Trim range (null = no trim) */
  trimRange: TrimRange | null;
  /** Transform state (crop, rotate, flip) */
  transform: VideoTransform;
  /** Speed multiplier (1 = normal) */
  speedMultiplier: number;
  /** Active filter preset ID (null = no filter) */
  filterPresetId: string | null;
  /** Color adjustments (brightness, contrast, saturation) */
  adjustments: AdjustmentValues;
  /** Audio configuration */
  audioConfig: AudioConfig;
  /** Text overlays to render */
  textOverlays: TextOverlay[];
  /** Export quality settings */
  exportConfig: ExportConfig;
}

// ─── Build Export Command ───────────────────────────────────

/**
 * Builds the full FFmpeg command string from all editing state.
 * This is the core of the non-destructive editing model — all edits
 * that were stored as metadata are compiled into one command here.
 *
 * @param params - All editing parameters.
 * @param outputUri - Path for the output file.
 * @returns The FFmpeg command string.
 */
export function buildExportCommand(
  params: ExportParams,
  outputUri: string,
): string {
  const builder = new CommandBuilder().input(params.sourceUri);

  // 1. Trim
  if (params.trimRange) {
    builder.trim(params.trimRange.startMs, params.trimRange.endMs);
  }

  // 2. Crop
  if (params.transform.cropRect) {
    builder.crop(params.transform.cropRect);
  }

  // 3. Rotate
  if (params.transform.rotation !== 0) {
    builder.rotate(params.transform.rotation);
  }

  // 4. Flip
  if (params.transform.flipHorizontal || params.transform.flipVertical) {
    builder.flip(
      params.transform.flipHorizontal,
      params.transform.flipVertical,
    );
  }

  // 5. Speed
  if (params.speedMultiplier !== 1) {
    builder.speed(params.speedMultiplier);
  }

  // 6. Filter preset
  if (params.filterPresetId) {
    const preset = FILTER_PRESETS[params.filterPresetId];
    if (preset) {
      builder.filter(preset.ffmpegFilter);
    }
  }

  // 7. Color adjustments
  const adj = params.adjustments;
  const hasAdjustments =
    adj.brightness !== 0 || adj.contrast !== 0 || adj.saturation !== 0;
  if (hasAdjustments) {
    builder.adjustments(adj);
  }

  // 8. Text overlays
  for (const overlay of params.textOverlays) {
    const textOpts: TextOverlayOptions = {
      text: overlay.text,
      x: overlay.x,
      y: overlay.y,
      fontSize: overlay.fontSize,
      color: overlay.color,
    };
    builder.overlayText(textOpts);
  }

  // 9. Audio
  if (params.audioConfig.isMuted) {
    builder.muteAudio();
  } else {
    // Background music mixing
    if (params.audioConfig.backgroundMusicUri) {
      builder.mixAudio(
        params.audioConfig.backgroundMusicUri,
        params.audioConfig.originalVolume,
        params.audioConfig.backgroundMusicVolume,
      );
    }

    // Voiceover mixing
    if (params.audioConfig.voiceoverUri) {
      builder.mixVoiceover(
        params.audioConfig.voiceoverUri,
        params.audioConfig.originalVolume,
        params.audioConfig.voiceoverVolume,
      );
    }

    // Volume adjustment (only if no mixing and volume isn't 100%)
    if (
      !params.audioConfig.backgroundMusicUri &&
      !params.audioConfig.voiceoverUri &&
      params.audioConfig.originalVolume !== 100
    ) {
      builder.volume(params.audioConfig.originalVolume);
    }
  }

  // 10. Resolution
  const resolution = EXPORT_RESOLUTIONS[params.exportConfig.resolution];
  builder.setResolution(resolution.width, resolution.height);

  // 11. Codec
  builder.setCodec(
    params.exportConfig.videoCodec,
    params.exportConfig.audioCodec,
  );

  // 12. Output
  builder.output(outputUri);

  return builder.build();
}

// ─── Execute Export ─────────────────────────────────────────

/**
 * Executes the full export pipeline:
 * builds the command, saves a checkpoint, runs FFmpeg, and returns the result.
 *
 * @param params - All editing parameters.
 * @param projectId - Project ID for file storage.
 * @param onProgress - Optional progress callback (0-1).
 * @returns Export result with output URI, file size, and duration.
 */
export async function executeExport(
  params: ExportParams,
  projectId: string,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<ExportResult> {
  const outputUri = createOutputFile(projectId, 'mp4');
  const command = buildExportCommand(params, outputUri);

  // Calculate expected output duration for progress tracking
  const outputDurationMs = calculateOutputDuration(params);

  // Save checkpoint before starting
  saveCheckpoint(projectId, {
    projectId,
    stage: 'processing',
    progress: 0,
    command,
    outputUri,
    timestamp: Date.now(),
  });

  // Execute the FFmpeg command
  await executeCommand(command, {
    totalDurationMs: outputDurationMs,
    onProgress,
  });

  // Success — clear checkpoint
  clearCheckpoint(projectId);

  // Gather result info
  const fileSize = getFileSize(outputUri);

  return {
    outputUri,
    fileSize,
    durationMs: outputDurationMs,
    resolution: params.exportConfig.resolution,
  };
}

// ─── Cancel Export ──────────────────────────────────────────

/**
 * Cancels the currently running export.
 * The checkpoint is preserved so the export can be retried.
 */
export async function cancelExport(): Promise<void> {
  await cancelExecution();
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Calculates the expected output duration based on trim range and speed.
 */
function calculateOutputDuration(params: ExportParams): number {
  let durationMs = params.sourceDurationMs;

  // Apply trim
  if (params.trimRange) {
    durationMs = params.trimRange.endMs - params.trimRange.startMs;
  }

  // Apply speed change
  if (params.speedMultiplier !== 1) {
    durationMs = durationMs / params.speedMultiplier;
  }

  return Math.max(durationMs, 0);
}
