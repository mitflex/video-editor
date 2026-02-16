/**
 * ============================================================
 *  FFMPEG SERVICE
 *  Single point of contact with ffmpeg-kit-react-native.
 *  Provides command execution with progress tracking,
 *  cancellation support, and media information probing.
 * ============================================================
 */

import {
  FFmpegKit,
  FFmpegKitConfig,
  FFprobeKit,
  ReturnCode,
} from '@apescoding/ffmpeg-kit-react-native';
import type {
  FFmpegSession,
  Statistics,
} from '@apescoding/ffmpeg-kit-react-native';

import type {
  FFmpegResult,
  MediaInfo,
  MediaStreamInfo,
  FFmpegProgress,
  ExecuteOptions,
} from './types';
import { FFmpegError } from './types';

// ─── Active Session Tracking ────────────────────────────────
let activeSession: FFmpegSession | null = null;

// ─── Command Execution ──────────────────────────────────────

/**
 * Executes an FFmpeg command string with optional progress tracking.
 *
 * @param command - The FFmpeg command (without the leading `ffmpeg`).
 * @param options - Optional progress callback and total duration for progress calculation.
 * @returns The execution result including return code, logs, and timing.
 * @throws {FFmpegError} If execution fails or is cancelled.
 *
 * @example
 * ```ts
 * const result = await executeCommand(
 *   '-i input.mp4 -ss 0 -to 10 -c copy output.mp4',
 *   { totalDurationMs: 10000, onProgress: (p) => console.log(p.progress) }
 * );
 * ```
 */
export async function executeCommand(
  command: string,
  options?: ExecuteOptions,
): Promise<FFmpegResult> {
  const startTime = Date.now();
  const { onProgress, totalDurationMs } = options ?? {};

  // Statistics callback for progress tracking
  const statisticsCallback = totalDurationMs
    ? (statistics: Statistics) => {
        if (!onProgress) return;

        const timeMs = statistics.getTime();
        const progress = totalDurationMs > 0
          ? Math.min(timeMs / totalDurationMs, 1)
          : 0;

        onProgress({
          progress,
          frame: statistics.getVideoFrameNumber(),
          fps: statistics.getVideoFps(),
          size: statistics.getSize(),
          timeMs,
          speed: statistics.getSpeed(),
          bitrate: statistics.getBitrate(),
        });
      }
    : undefined;

  // Execute asynchronously with callbacks
  const session = await FFmpegKit.executeAsync(
    command,
    undefined, // completeCallback — we await the session instead
    undefined, // logCallback
    statisticsCallback,
  );

  activeSession = session;

  // Wait for completion by polling return code
  const returnCode = await session.getReturnCode();
  const durationMs = Date.now() - startTime;
  const logs = await session.getLogsAsString();

  activeSession = null;

  if (ReturnCode.isSuccess(returnCode)) {
    return {
      returnCode: returnCode.getValue(),
      isSuccess: true,
      outputUri: '', // Caller knows the output path from the command
      durationMs,
      logs,
    };
  }

  if (ReturnCode.isCancel(returnCode)) {
    throw new FFmpegError(
      'CANCELLED',
      'FFmpeg execution was cancelled',
      logs,
      returnCode.getValue(),
    );
  }

  throw new FFmpegError(
    'EXECUTION_FAILED',
    'FFmpeg command failed',
    logs,
    returnCode.getValue(),
  );
}

/**
 * Cancels the currently active FFmpeg execution.
 * No-op if no execution is in progress.
 */
export async function cancelExecution(): Promise<void> {
  if (activeSession) {
    await activeSession.cancel();
    activeSession = null;
  } else {
    // Cancel all running sessions as fallback
    await FFmpegKit.cancel();
  }
}

// ─── Media Information ──────────────────────────────────────

/**
 * Probes a media file and returns structured information.
 *
 * @param uri - Path to the media file.
 * @returns Parsed media information including streams.
 * @throws {FFmpegError} If probing fails.
 */
export async function getMediaInfo(uri: string): Promise<MediaInfo> {
  const session = await FFprobeKit.getMediaInformation(uri);
  const returnCode = await session.getReturnCode();

  if (!ReturnCode.isSuccess(returnCode)) {
    const logs = await session.getLogsAsString();
    throw new FFmpegError(
      'INVALID_INPUT',
      `Failed to get media information for: ${uri}`,
      logs,
      returnCode.getValue(),
    );
  }

  const info = session.getMediaInformation();
  if (!info) {
    throw new FFmpegError(
      'INVALID_INPUT',
      `No media information returned for: ${uri}`,
    );
  }

  // Parse streams
  const rawStreams = info.getStreams() ?? [];
  const streams: MediaStreamInfo[] = rawStreams.map((stream) => {
    const type = parseStreamType(stream.getType());
    const result: MediaStreamInfo = {
      index: stream.getIndex(),
      type,
      codec: stream.getCodec() ?? 'unknown',
    };

    if (type === 'video') {
      result.width = stream.getWidth();
      result.height = stream.getHeight();
      result.fps = parseFrameRate(stream.getAverageFrameRate());
      result.averageFrameRate = stream.getAverageFrameRate();
    }

    if (type === 'audio') {
      result.sampleRate = stream.getSampleRate();
      result.channelLayout = stream.getChannelLayout();
    }

    result.bitrate = stream.getBitrate();

    return result;
  });

  return {
    filename: info.getFilename() ?? '',
    format: info.getFormat() ?? '',
    durationMs: (info.getDuration() ?? 0) * 1000,
    size: parseNumber(info.getSize()),
    bitrate: parseNumber(info.getBitrate()),
    streams,
  };
}

// ─── Version Check ──────────────────────────────────────────

/** Returns the FFmpeg version string. Useful for verifying the native module is linked. */
export async function getFFmpegVersion(): Promise<string> {
  return FFmpegKitConfig.getFFmpegVersion();
}

// ─── Helpers ────────────────────────────────────────────────

/** Parses a stream type string from FFprobe into a known type */
function parseStreamType(
  type: string,
): 'video' | 'audio' | 'subtitle' | 'data' {
  const normalized = (type ?? '').toLowerCase();
  if (normalized === 'video') return 'video';
  if (normalized === 'audio') return 'audio';
  if (normalized === 'subtitle') return 'subtitle';
  return 'data';
}

/** Parses a frame rate string like '30/1' or '29.97' into a number */
function parseFrameRate(fpsString: string | undefined): number | undefined {
  if (!fpsString) return undefined;

  // Handle fraction format: '30/1', '30000/1001'
  if (fpsString.includes('/')) {
    const [num, den] = fpsString.split('/').map(Number);
    if (den && !isNaN(num) && !isNaN(den)) {
      return Math.round((num / den) * 100) / 100;
    }
  }

  // Handle decimal format: '29.97'
  const parsed = parseFloat(fpsString);
  return isNaN(parsed) ? undefined : parsed;
}

/** Safely parses a string to number, returning 0 for invalid values */
function parseNumber(value: string | number | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}
