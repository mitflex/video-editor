/**
 * ============================================================
 *  ASSET REGISTRY
 *  Centralized asset definitions for the entire application.
 *  All images, fonts, and icons are registered here as a
 *  single source of truth — no scattered require() calls.
 *
 *  Usage:
 *    import { IMAGES, FONTS, FONT_MAP, ICONS } from '@/constants/assets';
 *
 *  NOTE: require() lines are commented out until actual asset
 *  files are added to assets/images/ and assets/fonts/.
 *  Uncomment each entry as the corresponding file becomes available.
 * ============================================================
 */

import type { ImageSourcePropType } from 'react-native';

// ─── Image Assets ────────────────────────────────────────────
//
// All static images used throughout the app.
// Organized by category: branding, placeholders, camera, editor, export.
//
export const IMAGES = {
  // ── App Branding ────────────────────────────────────────────
  // Uncomment when files are added to assets/images/
  // ICON: require('../assets/images/icon.png'),
  // SPLASH: require('../assets/images/splash.png'),
  // ADAPTIVE_ICON: require('../assets/images/adaptive-icon.png'),
  // LOGO: require('../assets/images/logo.png'),

  // ── Placeholders ────────────────────────────────────────────
  // VIDEO_PLACEHOLDER: require('../assets/images/video-placeholder.png'),
  // THUMBNAIL_PLACEHOLDER: require('../assets/images/thumbnail-placeholder.png'),
  // AUDIO_WAVEFORM: require('../assets/images/audio-waveform.png'),

  // ── Camera Screen ───────────────────────────────────────────
  // CAMERA_FLIP: require('../assets/images/camera-flip.png'),
  // FLASH_ON: require('../assets/images/flash-on.png'),
  // FLASH_OFF: require('../assets/images/flash-off.png'),
  // FLASH_AUTO: require('../assets/images/flash-auto.png'),
  // GRID_ICON: require('../assets/images/grid-icon.png'),
  // TIMER_ICON: require('../assets/images/timer-icon.png'),

  // ── Editor Screen ───────────────────────────────────────────
  // TRIM_ICON: require('../assets/images/trim-icon.png'),
  // SPLIT_ICON: require('../assets/images/split-icon.png'),
  // CROP_ICON: require('../assets/images/crop-icon.png'),
  // ROTATE_ICON: require('../assets/images/rotate-icon.png'),
  // FLIP_ICON: require('../assets/images/flip-icon.png'),
  // SPEED_ICON: require('../assets/images/speed-icon.png'),
  // FILTER_ICON: require('../assets/images/filter-icon.png'),
  // TEXT_ICON: require('../assets/images/text-icon.png'),
  // AUDIO_ICON: require('../assets/images/audio-icon.png'),
  // ADJUST_ICON: require('../assets/images/adjust-icon.png'),

  // ── Export & Share ──────────────────────────────────────────
  // SHARE_INSTAGRAM: require('../assets/images/share-instagram.png'),
  // SHARE_WHATSAPP: require('../assets/images/share-whatsapp.png'),
  // SHARE_YOUTUBE: require('../assets/images/share-youtube.png'),
  // EXPORT_SUCCESS: require('../assets/images/export-success.png'),
} as const;

/** Union type of all available image keys */
export type ImageKey = keyof typeof IMAGES;

// ─── Font Assets ─────────────────────────────────────────────
//
// Font family definitions for the text overlay editor.
// Each font has a display name (shown in UI) and a family name
// (used in React Native styles / FFmpeg drawtext).
//
// Actual .ttf font files will be loaded via expo-font
// when added to assets/fonts/.
//
export const FONTS = {
  SANS: {
    displayName: 'Sans',
    family: 'System',
    // file: undefined — uses system default, no file needed
  },
  SERIF: {
    displayName: 'Serif',
    family: 'serif',
    // file: require('../assets/fonts/serif.ttf'),
  },
  MONO: {
    displayName: 'Mono',
    family: 'mono',
    // file: require('../assets/fonts/mono.ttf'),
  },
  BOLD_SANS: {
    displayName: 'Bold',
    family: 'bold-sans',
    // file: require('../assets/fonts/bold-sans.ttf'),
  },
} as const;

/** Union type of all available font keys */
export type FontKey = keyof typeof FONTS;

/**
 * Font file mapping for expo-font loading.
 * Uncomment entries as actual .ttf files are added to assets/fonts/.
 *
 * Usage with expo-font:
 *   await Font.loadAsync(FONT_FILES);
 */
export const FONT_FILES: Record<string, any> = {
  // 'serif': require('../assets/fonts/serif.ttf'),
  // 'mono': require('../assets/fonts/mono.ttf'),
  // 'bold-sans': require('../assets/fonts/bold-sans.ttf'),
};

/**
 * Maps font family names to their FFmpeg-compatible font file paths.
 * Used by the export pipeline to burn text overlays into the video.
 * Populated at runtime after fonts are loaded.
 */
export const FFMPEG_FONT_PATHS: Record<string, string> = {
  // Will be populated at runtime with actual file system paths
  // e.g. 'serif': '/path/to/serif.ttf'
};

// ─── SVG / Icon Assets ───────────────────────────────────────
//
// Custom icons beyond what @expo/vector-icons provides.
// For most icons, prefer using Ionicons or MaterialIcons from
// @expo/vector-icons. Only register custom SVG/PNG icons here.
//
export const ICONS = {
  // Uncomment as custom icons are added to assets/images/
  // PLAYHEAD: require('../assets/images/playhead.png'),
  // TRIM_HANDLE: require('../assets/images/trim-handle.png'),
} as const;

/** Union type of all available icon keys */
export type IconKey = keyof typeof ICONS;
