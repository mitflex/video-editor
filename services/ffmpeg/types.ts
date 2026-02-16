/**
 * ============================================================
 *  FFMPEG TYPES
 *  Type definitions for the FFmpeg service layer.
 *  These model the FFmpeg execution domain, separate from
 *  app-level types in types/video.ts.
 * ============================================================
 */

// ─── FFmpeg Result ──────────────────────────────────────────
/** Result of an FFmpeg command execution */
export interface FFmpegResult {
  /** FFmpeg return code */
  returnCode: number;
  /** Whether the command completed successfully */
  isSuccess: boolean;
  /** Path to the output file (if applicable) */
  outputUri: string;
  /** Wall-clock execution time in milliseconds */
  durationMs: number;
  /** Combined log output from FFmpeg */
  logs: string;
}

// ─── Media Info ─────────────────────────────────────────────
/** Raw media information from FFprobe */
export interface MediaInfo {
  /** Source file name */
  filename: string;
  /** Container format (e.g., 'mov', 'mp4') */
  format: string;
  /** Duration in milliseconds */
  durationMs: number;
  /** File size in bytes */
  size: number;
  /** Overall bitrate in bits per second */
  bitrate: number;
  /** Stream information */
  streams: MediaStreamInfo[];
}

// ─── Media Stream Info ──────────────────────────────────────
/** Information about a single media stream */
export interface MediaStreamInfo {
  /** Stream index */
  index: number;
  /** Stream type */
  type: 'video' | 'audio' | 'subtitle' | 'data';
  /** Codec name (e.g., 'h264', 'aac') */
  codec: string;
  /** Width in pixels (video streams only) */
  width?: number;
  /** Height in pixels (video streams only) */
  height?: number;
  /** Frames per second (video streams only) */
  fps?: number;
  /** Sample rate as string (audio streams only, e.g., '44100') */
  sampleRate?: string;
  /** Channel layout (audio streams only, e.g., 'stereo') */
  channelLayout?: string;
  /** Bitrate as string (e.g., '128000') */
  bitrate?: string;
  /** Average frame rate as raw string from FFprobe (e.g., '30/1') */
  averageFrameRate?: string;
}

// ─── FFmpeg Progress ────────────────────────────────────────
/** Progress data emitted during FFmpeg command execution */
export interface FFmpegProgress {
  /** Normalized progress from 0.0 to 1.0 */
  progress: number;
  /** Current video frame being processed */
  frame: number;
  /** Current processing speed in FPS */
  fps: number;
  /** Current output size in bytes */
  size: number;
  /** Time position being processed in milliseconds */
  timeMs: number;
  /** Processing speed multiplier (e.g., 1.5 = 1.5x real-time) */
  speed: number;
  /** Current output bitrate in kbits/s */
  bitrate: number;
}

// ─── FFmpeg Error ───────────────────────────────────────────
/** Error codes for FFmpeg execution failures */
export type FFmpegErrorCode =
  | 'EXECUTION_FAILED'
  | 'CANCELLED'
  | 'INVALID_INPUT'
  | 'TIMEOUT'
  | 'UNKNOWN';

/** Structured error from FFmpeg execution */
export class FFmpegError extends Error {
  /** Error classification */
  readonly code: FFmpegErrorCode;
  /** FFmpeg log output (if available) */
  readonly logs?: string;
  /** FFmpeg return code (if available) */
  readonly returnCode?: number;

  constructor(
    code: FFmpegErrorCode,
    message: string,
    logs?: string,
    returnCode?: number,
  ) {
    super(message);
    this.name = 'FFmpegError';
    this.code = code;
    this.logs = logs;
    this.returnCode = returnCode;
  }
}

// ─── Execute Options ────────────────────────────────────────
/** Options for FFmpeg command execution */
export interface ExecuteOptions {
  /** Progress callback invoked during processing */
  onProgress?: (progress: FFmpegProgress) => void;
  /** Total duration of the input in milliseconds (required for accurate progress) */
  totalDurationMs?: number;
}
