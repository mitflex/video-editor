/**
 * ============================================================
 *  AUDIO SERVICE
 *  Audio manipulation operations for video editing:
 *  mix background music, replace audio, mute, overlay voiceover,
 *  and adjust volume.
 * ============================================================
 */

import { CommandBuilder } from '@/services/ffmpeg/commandBuilder';
import { executeCommand } from '@/services/ffmpeg/ffmpegService';
import type { FFmpegProgress, FFmpegResult } from '@/services/ffmpeg/types';
import { createTempFile } from '@/services/file/fileService';

// ─── Mix Background Music ───────────────────────────────────

/**
 * Mixes the original video audio with a background music track.
 * Both audio sources play simultaneously with independent volume controls.
 * The output duration matches the original video (music is truncated or faded).
 *
 * @param videoUri - Path to the source video.
 * @param backgroundMusicUri - Path to the background music file.
 * @param videoVolume - Original audio volume (0-100).
 * @param musicVolume - Background music volume (0-100).
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function mixAudioTracks(
  videoUri: string,
  backgroundMusicUri: string,
  videoVolume: number,
  musicVolume: number,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(videoUri)
    .mixAudio(backgroundMusicUri, videoVolume, musicVolume)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Replace Audio ──────────────────────────────────────────

/**
 * Replaces the video's original audio with a new audio track.
 * The original audio is stripped and replaced entirely.
 *
 * @param videoUri - Path to the source video.
 * @param audioUri - Path to the replacement audio file.
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function replaceAudio(
  videoUri: string,
  audioUri: string,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  const outputUri = createTempFile(projectId, 'mp4');

  // Build a raw command: map video from input 0, audio from input 1
  // -c:v copy preserves video quality (no re-encode)
  // -shortest ensures output ends when the shorter stream ends
  const command = `-y -i "${videoUri}" -i "${audioUri}" -map 0:v -map 1:a -c:v copy -shortest "${outputUri}"`;

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Mute Video ─────────────────────────────────────────────

/**
 * Strips all audio from a video, producing a silent output.
 *
 * @param videoUri - Path to the source video.
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function muteVideo(
  videoUri: string,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(videoUri)
    .muteAudio()
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Overlay Voiceover ──────────────────────────────────────

/**
 * Overlays a voiceover recording on top of the original video audio.
 * Both tracks play simultaneously with independent volume controls.
 *
 * @param videoUri - Path to the source video.
 * @param voiceoverUri - Path to the voiceover audio file.
 * @param originalVolume - Original audio volume (0-100).
 * @param voiceoverVolume - Voiceover volume (0-100).
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function overlayVoiceover(
  videoUri: string,
  voiceoverUri: string,
  originalVolume: number,
  voiceoverVolume: number,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(videoUri)
    .mixVoiceover(voiceoverUri, originalVolume, voiceoverVolume)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}

// ─── Adjust Volume ──────────────────────────────────────────

/**
 * Adjusts the volume of the original video audio.
 *
 * @param videoUri - Path to the source video.
 * @param volumePercent - Volume level (0-100, where 100 is original volume).
 * @param projectId - Project ID for temp file storage.
 * @param totalDurationMs - Duration of the video for progress tracking.
 * @param onProgress - Optional progress callback.
 */
export async function adjustVolume(
  videoUri: string,
  volumePercent: number,
  projectId: string,
  totalDurationMs?: number,
  onProgress?: (progress: FFmpegProgress) => void,
): Promise<FFmpegResult> {
  if (volumePercent === 100) {
    return {
      returnCode: 0,
      isSuccess: true,
      outputUri: videoUri,
      durationMs: 0,
      logs: '',
    };
  }

  const outputUri = createTempFile(projectId, 'mp4');

  const command = new CommandBuilder()
    .input(videoUri)
    .volume(volumePercent)
    .output(outputUri)
    .build();

  const result = await executeCommand(command, {
    totalDurationMs,
    onProgress,
  });

  return { ...result, outputUri };
}
