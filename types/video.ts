/**
 * ============================================================
 *  VIDEO TYPES
 *  Core type definitions for video metadata, editing operations,
 *  and export configuration.
 * ============================================================
 */

// ─── Video Metadata ──────────────────────────────────────────
export interface VideoMetadata {
  /** Full file path or URI */
  uri: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** Frames per second */
  fps: number;
  /** Video codec (e.g., 'h264') */
  codec: string;
  /** File size in bytes */
  fileSize: number;
  /** Whether the video has an audio track */
  hasAudio: boolean;
  /** Bitrate in bits per second */
  bitrate: number;
  /** Rotation from metadata (0, 90, 180, 270) */
  rotation: number;
}

// ─── Trim Range ──────────────────────────────────────────────
export interface TrimRange {
  /** Trim start position in milliseconds */
  startMs: number;
  /** Trim end position in milliseconds */
  endMs: number;
}

// ─── Crop Rectangle ──────────────────────────────────────────
export interface CropRect {
  /** X offset from left (pixels) */
  x: number;
  /** Y offset from top (pixels) */
  y: number;
  /** Crop width (pixels) */
  width: number;
  /** Crop height (pixels) */
  height: number;
}

// ─── Transform State ─────────────────────────────────────────
export interface VideoTransform {
  cropRect: CropRect | null;
  rotation: 0 | 90 | 180 | 270;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

// ─── Adjustment Values ───────────────────────────────────────
export interface AdjustmentValues {
  /** -100 to +100, default 0 */
  brightness: number;
  /** -100 to +100, default 0 */
  contrast: number;
  /** -100 to +100, default 0 */
  saturation: number;
}

// ─── Audio Configuration ─────────────────────────────────────
export interface AudioConfig {
  /** Original video audio volume (0-100) */
  originalVolume: number;
  /** Whether original audio is muted */
  isMuted: boolean;
  /** Background music file URI */
  backgroundMusicUri: string | null;
  /** Background music volume (0-100) */
  backgroundMusicVolume: number;
  /** Voiceover file URI */
  voiceoverUri: string | null;
  /** Voiceover volume (0-100) */
  voiceoverVolume: number;
}

// ─── Export Configuration ────────────────────────────────────
export interface ExportConfig {
  /** Output resolution */
  resolution: '720p' | '1080p';
  /** Output aspect ratio */
  aspectRatio: '9:16';
  /** Video codec */
  videoCodec: 'libx264';
  /** Audio codec */
  audioCodec: 'aac';
}

// ─── Export Resolution Dimensions ────────────────────────────
export const EXPORT_RESOLUTIONS: Record<ExportConfig['resolution'], { width: number; height: number }> = {
  '720p': { width: 720, height: 1280 },
  '1080p': { width: 1080, height: 1920 },
};

// ─── Export Status ───────────────────────────────────────────
export type ExportStatus =
  | 'idle'
  | 'preparing'
  | 'processing'
  | 'compressing'
  | 'complete'
  | 'error';

// ─── Export Result ───────────────────────────────────────────
export interface ExportResult {
  /** Output file URI */
  outputUri: string;
  /** File size in bytes */
  fileSize: number;
  /** Duration in milliseconds */
  durationMs: number;
  /** Resolution used */
  resolution: ExportConfig['resolution'];
}

// ─── Validation Result ───────────────────────────────────────
export interface VideoValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
