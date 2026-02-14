/**
 * ============================================================
 *  FILTER CONSTANTS
 *  Video filter presets mapped to FFmpeg filter command strings.
 *  Used by the filter service and filter UI panel.
 *
 *  Usage:
 *    import { FILTER_PRESETS, ADJUSTMENT_RANGES } from '@/constants/filters';
 * ============================================================
 */

// ─── Filter Preset Definition ────────────────────────────────
export interface FilterPreset {
  /** Unique identifier */
  id: string;
  /** Display name shown in UI */
  displayName: string;
  /** FFmpeg video filter string */
  ffmpegFilter: string;
  /** Preview description */
  description: string;
  /** Accent color for UI thumbnail border */
  accentColor: string;
}

// ─── Filter Presets ──────────────────────────────────────────
export const FILTER_PRESETS: Record<string, FilterPreset> = {
  warm: {
    id: 'warm',
    displayName: 'Warm',
    ffmpegFilter: 'colortemperature=temperature=6500,colorbalance=rs=0.1:gs=0.05:bs=-0.1',
    description: 'Golden warm tones',
    accentColor: '#F59E0B',
  },
  cool: {
    id: 'cool',
    displayName: 'Cool',
    ffmpegFilter: 'colortemperature=temperature=9000,colorbalance=rs=-0.1:gs=0:bs=0.1',
    description: 'Blue cool tones',
    accentColor: '#06B6D4',
  },
  vintage: {
    id: 'vintage',
    displayName: 'Vintage',
    ffmpegFilter: 'curves=vintage,colorbalance=rs=0.15:gs=0.1:bs=0',
    description: 'Retro film look',
    accentColor: '#D97706',
  },
  bw: {
    id: 'bw',
    displayName: 'B&W',
    ffmpegFilter: 'hue=s=0',
    description: 'Classic black & white',
    accentColor: '#94A3B8',
  },
} as const;

// ─── Filter List (Ordered for UI) ───────────────────────────
export const FILTER_LIST: FilterPreset[] = [
  FILTER_PRESETS.warm,
  FILTER_PRESETS.cool,
  FILTER_PRESETS.vintage,
  FILTER_PRESETS.bw,
];

// ─── Adjustment Ranges ───────────────────────────────────────
// UI range: -100 to +100 (integer, default 0)
// These map to FFmpeg eq filter ranges
export const ADJUSTMENT_RANGES = {
  brightness: {
    displayName: 'Brightness',
    min: -100,
    max: 100,
    default: 0,
    /** Convert UI value (-100..100) to FFmpeg eq brightness (-1.0..1.0) */
    toFFmpeg: (value: number): number => value / 100,
  },
  contrast: {
    displayName: 'Contrast',
    min: -100,
    max: 100,
    default: 0,
    /** Convert UI value (-100..100) to FFmpeg eq contrast (0.0..2.0, default 1.0) */
    toFFmpeg: (value: number): number => 1 + value / 100,
  },
  saturation: {
    displayName: 'Saturation',
    min: -100,
    max: 100,
    default: 0,
    /** Convert UI value (-100..100) to FFmpeg eq saturation (0.0..3.0, default 1.0) */
    toFFmpeg: (value: number): number => {
      if (value >= 0) {
        return 1 + (value / 100) * 2; // 0..100 -> 1.0..3.0
      }
      return 1 + value / 100; // -100..0 -> 0.0..1.0
    },
  },
} as const;

// ─── Adjustment Key Type ─────────────────────────────────────
export type AdjustmentKey = keyof typeof ADJUSTMENT_RANGES;

// ─── Speed Presets ───────────────────────────────────────────
export const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
] as const;

export type SpeedValue = (typeof SPEED_OPTIONS)[number]['value'];

// ─── Duration Presets ────────────────────────────────────────
export const DURATION_OPTIONS = [
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
] as const;

export type DurationValue = (typeof DURATION_OPTIONS)[number]['value'];

// ─── Countdown Presets ───────────────────────────────────────
export const COUNTDOWN_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: '3s', value: 3 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
] as const;

export type CountdownValue = (typeof COUNTDOWN_OPTIONS)[number]['value'];

// ─── Max Video Duration ──────────────────────────────────────
export const MAX_VIDEO_DURATION_SEC = 60;
export const MAX_VIDEO_DURATION_MS = MAX_VIDEO_DURATION_SEC * 1000;
export const MIN_VIDEO_DURATION_MS = 1000; // 1 second minimum
