/**
 * ============================================================
 *  FILTER SERVICE
 *  Standalone video filter and color adjustment operations.
 *  Applies filter presets and brightness/contrast/saturation
 *  adjustments via FFmpeg.
 * ============================================================
 */

import { FILTER_PRESETS } from '@/constants/filters';
import { CommandBuilder } from '@/services/ffmpeg/commandBuilder';
import { executeCommand } from '@/services/ffmpeg/ffmpegService';
import type { FFmpegProgress, FFmpegResult } from '@/services/ffmpeg/types';
import { createTempFile } from '@/services/file/fileService';
import type { AdjustmentValues } from '@/types/video';

// ─── Filter Presets ─────────────────────────────────────────

/**
 * Applies a named color filter preset to a video.
 *
 * @param uri - Path to the source video.
 * @param filterPresetId - Filter preset key (e.g., 'warm', 'cool', 'vintage', 'bw').
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function applyFilter(
  uri: string,
  filterPresetId: string,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  const preset = FILTER_PRESETS[filterPresetId];
  if (!preset) {
    throw new Error(`Unknown filter preset: ${filterPresetId}`);
  }

  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(uri)
    .filter(preset.ffmpegFilter)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Adjustments ────────────────────────────────────────────

/**
 * Applies brightness, contrast, and saturation adjustments to a video.
 * UI values (-100 to +100) are converted to FFmpeg ranges automatically.
 *
 * @param uri - Path to the source video.
 * @param adjustments - Adjustment values (brightness, contrast, saturation).
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function applyAdjustments(
  uri: string,
  adjustments: AdjustmentValues,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  // Check if all values are at default (no-op)
  const isDefault =
    adjustments.brightness === 0 &&
    adjustments.contrast === 0 &&
    adjustments.saturation === 0;

  if (isDefault) {
    return {
      returnCode: 0,
      isSuccess: true,
      outputUri: uri,
      durationMs: 0,
      logs: '',
    };
  }

  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(uri)
    .adjustments(adjustments)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}
