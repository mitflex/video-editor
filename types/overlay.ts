/**
 * ============================================================
 *  OVERLAY TYPES
 *  Type definitions for text overlays and visual layers
 *  rendered on top of the video preview.
 * ============================================================
 */

// ─── Text Overlay ────────────────────────────────────────────
export interface TextOverlay {
  /** Unique identifier */
  id: string;
  /** Text content */
  text: string;
  /** X position (0-1 relative to video width) */
  x: number;
  /** Y position (0-1 relative to video height) */
  y: number;
  /** Font size in points */
  fontSize: number;
  /** Font family key from FONTS constant */
  fontFamily: string;
  /** Text color in hex format (e.g., '#FFFFFF') */
  color: string;
  /** Computed width (pixels, updated on render) */
  width: number;
  /** Computed height (pixels, updated on render) */
  height: number;
}

// ─── Text Style Options ──────────────────────────────────────
export interface TextStyleOptions {
  fontFamily: string;
  fontSize: number;
  color: string;
}

// ─── Color Palette for Text ──────────────────────────────────
export const TEXT_COLOR_PALETTE = [
  '#FFFFFF', // White
  '#000000', // Black
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#F59E0B', // Yellow/Amber
  '#10B981', // Green
  '#EC4899', // Pink
  '#F97316', // Orange
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
] as const;

export type TextColor = (typeof TEXT_COLOR_PALETTE)[number];
