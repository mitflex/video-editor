/**
 * ============================================================
 *  TRANSFORM SERVICE
 *  Standalone video transform operations via FFmpeg:
 *  crop, rotate, flip, and speed change.
 * ============================================================
 */

import { CommandBuilder } from '@/services/ffmpeg/commandBuilder';
import { executeCommand } from '@/services/ffmpeg/ffmpegService';
import type { FFmpegProgress, FFmpegResult } from '@/services/ffmpeg/types';
import { createTempFile } from '@/services/file/fileService';
import type { CropRect } from '@/types/video';

// ─── Crop ───────────────────────────────────────────────────

/**
 * Crops a video to the specified rectangle.
 *
 * @param uri - Path to the source video.
 * @param cropRect - The crop rectangle (x, y, width, height in pixels).
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function cropVideo(
  uri: string,
  cropRect: CropRect,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(uri)
    .crop(cropRect)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Rotate ─────────────────────────────────────────────────

/**
 * Rotates a video by the specified degrees (90, 180, or 270).
 *
 * @param uri - Path to the source video.
 * @param degrees - Rotation angle (0, 90, 180, or 270).
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function rotateVideo(
  uri: string,
  degrees: 0 | 90 | 180 | 270,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  if (degrees === 0) {
    return { returnCode: 0, isSuccess: true, outputUri: uri, durationMs: 0, logs: '' };
  }

  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(uri)
    .rotate(degrees)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Flip ───────────────────────────────────────────────────

/**
 * Flips a video horizontally and/or vertically.
 *
 * @param uri - Path to the source video.
 * @param horizontal - Whether to flip horizontally.
 * @param vertical - Whether to flip vertically.
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function flipVideo(
  uri: string,
  horizontal: boolean,
  vertical: boolean,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  if (!horizontal && !vertical) {
    return { returnCode: 0, isSuccess: true, outputUri: uri, durationMs: 0, logs: '' };
  }

  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(uri)
    .flip(horizontal, vertical)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Speed ──────────────────────────────────────────────────

/**
 * Changes the playback speed of a video.
 * Handles both video (setpts) and audio (atempo) speed adjustments.
 *
 * @param uri - Path to the source video.
 * @param multiplier - Speed multiplier (e.g., 0.5 = half speed, 2 = double speed).
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the source video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function changeSpeed(
  uri: string,
  multiplier: number,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  if (multiplier === 1) {
    return { returnCode: 0, isSuccess: true, outputUri: uri, durationMs: 0, logs: '' };
  }

  const outputUri = createTempFile(projectId, 'mp4');

  // Output duration changes with speed
  const outputDurationMs = totalDurationMs
    ? totalDurationMs / multiplier
    : undefined;

  const command = new CommandBuilder()
    .input(uri)
    .speed(multiplier)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs: outputDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}
