/**
 * ============================================================
 *  useClipSelector
 *  Hook managing clip selection state and gesture math.
 *  Handles pixel-to-time conversion, handle constraints,
 *  and 60s max duration validation.
 *
 *  Usage:
 *    const { startMs, endMs, ... } = useClipSelector({
 *      durationMs: 120000,
 *      timelineWidth: 300,
 *    });
 * ============================================================
 */

import { useCallback, useMemo, useState } from 'react';

import { MAX_VIDEO_DURATION_MS, MIN_VIDEO_DURATION_MS } from '@/constants/filters';

// ─── Types ──────────────────────────────────────────────────

interface UseClipSelectorOptions {
  /** Total video duration in milliseconds */
  durationMs: number;
  /** Width of the timeline strip in pixels */
  timelineWidth: number;
}

interface UseClipSelectorResult {
  /** Current start time in ms */
  startMs: number;
  /** Current end time in ms */
  endMs: number;
  /** Selected duration in ms */
  selectedDurationMs: number;
  /** Whether the selection exceeds 60s */
  isOverLimit: boolean;
  /** Whether the selection is under 1s */
  isUnderMinimum: boolean;
  /** Whether the selection is valid */
  isValid: boolean;
  /** Start handle position in pixels */
  startPx: number;
  /** End handle position in pixels */
  endPx: number;
  /** Convert pixel offset to milliseconds */
  pxToMs: (px: number) => number;
  /** Convert milliseconds to pixel offset */
  msToPx: (ms: number) => number;
  /** Update start handle position */
  setStartPx: (px: number) => void;
  /** Update end handle position */
  setEndPx: (px: number) => void;
  /** Reset to default selection (first 60s or full video) */
  reset: () => void;
}

// ─── Hook ───────────────────────────────────────────────────

export function useClipSelector({
  durationMs,
  timelineWidth,
}: UseClipSelectorOptions): UseClipSelectorResult {
  // Calculate default end: min of 60s or full video
  const defaultEndMs = Math.min(durationMs, MAX_VIDEO_DURATION_MS);

  const [startMs, setStartMs] = useState(0);
  const [endMs, setEndMs] = useState(defaultEndMs);

  // ── Conversion helpers ──────────────────────────────────

  const pxToMs = useCallback(
    (px: number): number => {
      if (timelineWidth <= 0) return 0;
      return Math.round((px / timelineWidth) * durationMs);
    },
    [timelineWidth, durationMs]
  );

  const msToPx = useCallback(
    (ms: number): number => {
      if (durationMs <= 0) return 0;
      return (ms / durationMs) * timelineWidth;
    },
    [timelineWidth, durationMs]
  );

  // ── Derived values ─────────────────────────────────────

  const selectedDurationMs = endMs - startMs;
  const isOverLimit = selectedDurationMs > MAX_VIDEO_DURATION_MS;
  const isUnderMinimum = selectedDurationMs < MIN_VIDEO_DURATION_MS;
  const isValid = !isOverLimit && !isUnderMinimum;
  const startPx = msToPx(startMs);
  const endPx = msToPx(endMs);

  // ── Handle updates with constraints ────────────────────

  const setStartPx = useCallback(
    (px: number) => {
      const ms = pxToMs(Math.max(0, Math.min(px, timelineWidth)));
      // Start can't go past (end - MIN_DURATION)
      const maxStart = endMs - MIN_VIDEO_DURATION_MS;
      setStartMs(Math.min(ms, maxStart));
    },
    [pxToMs, timelineWidth, endMs]
  );

  const setEndPx = useCallback(
    (px: number) => {
      const ms = pxToMs(Math.max(0, Math.min(px, timelineWidth)));
      // End can't go before (start + MIN_DURATION)
      const minEnd = startMs + MIN_VIDEO_DURATION_MS;
      // End can't exceed video duration
      setEndMs(Math.min(Math.max(ms, minEnd), durationMs));
    },
    [pxToMs, timelineWidth, startMs, durationMs]
  );

  const reset = useCallback(() => {
    setStartMs(0);
    setEndMs(Math.min(durationMs, MAX_VIDEO_DURATION_MS));
  }, [durationMs]);

  return useMemo(
    () => ({
      startMs,
      endMs,
      selectedDurationMs,
      isOverLimit,
      isUnderMinimum,
      isValid,
      startPx,
      endPx,
      pxToMs,
      msToPx,
      setStartPx,
      setEndPx,
      reset,
    }),
    [
      startMs,
      endMs,
      selectedDurationMs,
      isOverLimit,
      isUnderMinimum,
      isValid,
      startPx,
      endPx,
      pxToMs,
      msToPx,
      setStartPx,
      setEndPx,
      reset,
    ]
  );
}
