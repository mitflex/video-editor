/**
 * ============================================================
 *  TRIM SERVICE
 *  Standalone video trimming via FFmpeg.
 *  Used by the clip selector (import flow) and trim panel (editor).
 * ============================================================
 */

import { CommandBuilder } from '@/services/ffmpeg/commandBuilder';
import { executeCommand } from '@/services/ffmpeg/ffmpegService';
import type { FFmpegProgress, FFmpegResult } from '@/services/ffmpeg/types';
import { createTempFile } from '@/services/file/fileService';

// ─── Trim ───────────────────────────────────────────────────

/**
 * Trims a video to the specified time range.
 *
 * @param uri - Path to the source video.
 * @param startMs - Trim start in milliseconds.
 * @param endMs - Trim end in milliseconds.
 * @param projectId - Project ID for temp file storage.
 * @param onProgress - Optional progress callback.
 * @returns FFmpeg execution result. The trimmed file is at the temp path.
 */
export async function trimVideo(
  uri: string,
  startMs: number,
  endMs: number,
  projectId: string,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  const outputUri = createTempFile(projectId, 'mp4');
  const outputDurationMs = endMs - startMs;

  const command = new CommandBuilder()
    .input(uri)
    .trim(startMs, endMs)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs: outputDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}
