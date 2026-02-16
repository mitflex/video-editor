/**
 * ============================================================
 *  THUMBNAIL SERVICE
 *  Generates timeline thumbnails for the video editor.
 *  Uses expo-video-thumbnails (not FFmpeg) for fast extraction.
 * ============================================================
 */

import * as VideoThumbnails from 'expo-video-thumbnails';

import { getThumbnailDir } from '@/services/file/fileService';

// ─── Constants ──────────────────────────────────────────────
const DEFAULT_QUALITY = 0.5;
const MIN_THUMBNAIL_COUNT = 5;
const MAX_THUMBNAIL_COUNT = 30;
/** Generate one thumbnail per this many milliseconds of video */
const MS_PER_THUMBNAIL = 2000;

// ─── Timeline Thumbnails ────────────────────────────────────

/**
 * Generates evenly-spaced thumbnails for the timeline strip.
 *
 * @param uri - Path to the video file.
 * @param durationMs - Video duration in milliseconds.
 * @param projectId - Project ID for storing thumbnails.
 * @param count - Number of thumbnails to generate (auto-calculated if omitted).
 * @returns Array of thumbnail image URIs.
 */
export async function generateTimelineThumbnails(
  uri: string,
  durationMs: number,
  projectId: string,
  count?: number,
): Promise<string[]> {
  const thumbnailCount = count ?? calculateThumbnailCount(durationMs);

  // Ensure the thumbnails directory is available
  const thumbDir = getThumbnailDir(projectId);
  if (!thumbDir.exists) {
    thumbDir.create({ intermediates: true, idempotent: true });
  }

  const thumbnails: string[] = [];

  for (let i = 0; i < thumbnailCount; i++) {
    // Distribute thumbnails evenly across the duration
    // Offset slightly from 0 and end to avoid black frames
    const timeMs = Math.round(
      (durationMs * (i + 0.5)) / thumbnailCount,
    );

    try {
      const result = await VideoThumbnails.getThumbnailAsync(uri, {
        time: timeMs,
        quality: DEFAULT_QUALITY,
      });
      thumbnails.push(result.uri);
    } catch {
      // Skip failed thumbnails — gaps are acceptable
      continue;
    }
  }

  return thumbnails;
}

// ─── Single Thumbnail ───────────────────────────────────────

/**
 * Generates a single thumbnail at a specific time position.
 * Returns the temporary URI directly from expo-video-thumbnails.
 *
 * @param uri - Path to the video file.
 * @param timeMs - Time position in milliseconds.
 * @returns Thumbnail image URI.
 */
export async function generateSingleThumbnail(
  uri: string,
  timeMs: number,
): Promise<string> {
  const result = await VideoThumbnails.getThumbnailAsync(uri, {
    time: timeMs,
    quality: DEFAULT_QUALITY,
  });
  return result.uri;
}

// ─── Helpers ────────────────────────────────────────────────

/** Calculates the appropriate number of thumbnails based on duration */
function calculateThumbnailCount(durationMs: number): number {
  const calculated = Math.round(durationMs / MS_PER_THUMBNAIL);
  return Math.max(MIN_THUMBNAIL_COUNT, Math.min(calculated, MAX_THUMBNAIL_COUNT));
}
