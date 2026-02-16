/**
 * ============================================================
 *  METADATA SERVICE
 *  Bridges the FFmpeg probe layer to app-level VideoMetadata.
 *  Extracts video information and validates against app constraints.
 * ============================================================
 */

import {
  MAX_VIDEO_DURATION_MS,
  MIN_VIDEO_DURATION_MS,
} from '@/constants/filters';
import type { VideoMetadata, VideoValidation } from '@/types/video';
import { getMediaInfo } from '@/services/ffmpeg/ffmpegService';

// ─── Metadata Extraction ────────────────────────────────────

/**
 * Extracts structured video metadata from a file.
 * Probes the file via FFmpeg and maps the result to the
 * app-level VideoMetadata interface.
 *
 * @param uri - Path to the video file.
 * @returns Parsed video metadata.
 * @throws {FFmpegError} If probing fails.
 */
export async function getVideoMetadata(uri: string): Promise<VideoMetadata> {
  const info = await getMediaInfo(uri);

  // Find the first video stream
  const videoStream = info.streams.find((s) => s.type === 'video');
  // Check for audio stream presence
  const hasAudio = info.streams.some((s) => s.type === 'audio');

  // Parse rotation from video stream tags (if available)
  const rotation = videoStream
    ? normalizeRotation(videoStream.averageFrameRate, 0)
    : 0;

  return {
    uri,
    durationMs: info.durationMs,
    width: videoStream?.width ?? 0,
    height: videoStream?.height ?? 0,
    fps: videoStream?.fps ?? 30,
    codec: videoStream?.codec ?? 'unknown',
    fileSize: info.size,
    hasAudio,
    bitrate: info.bitrate,
    rotation,
  };
}

// ─── Validation ─────────────────────────────────────────────

/**
 * Validates video metadata against app constraints.
 *
 * Rules:
 * - Duration must be >= MIN_VIDEO_DURATION_MS (1s)
 * - Duration <= MAX_VIDEO_DURATION_MS (60s) is a warning (not an error,
 *   since the clip selector handles trimming longer videos)
 * - Must have valid dimensions (width > 0, height > 0)
 * - Must have a video stream (codec !== 'unknown')
 */
export function validateVideoConstraints(
  metadata: VideoMetadata,
): VideoValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Duration checks
  if (metadata.durationMs < MIN_VIDEO_DURATION_MS) {
    errors.push(
      `Video is too short (${Math.round(metadata.durationMs)}ms). Minimum duration is ${MIN_VIDEO_DURATION_MS}ms.`,
    );
  }

  if (metadata.durationMs > MAX_VIDEO_DURATION_MS) {
    warnings.push(
      `Video exceeds ${MAX_VIDEO_DURATION_MS / 1000}s limit. It will need to be trimmed.`,
    );
  }

  // Dimension checks
  if (metadata.width <= 0 || metadata.height <= 0) {
    errors.push('Video has invalid dimensions.');
  }

  // Codec check
  if (metadata.codec === 'unknown') {
    errors.push('Could not detect video codec.');
  }

  // Audio warning
  if (!metadata.hasAudio) {
    warnings.push('Video has no audio track.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Normalizes a rotation value to one of the valid angles.
 * Rotation can come from video metadata tags.
 */
function normalizeRotation(
  _frameRate: string | undefined,
  rawRotation: number,
): number {
  const normalized = ((rawRotation % 360) + 360) % 360;
  if (normalized === 90 || normalized === 180 || normalized === 270) {
    return normalized;
  }
  return 0;
}
