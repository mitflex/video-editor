/**
 * ============================================================
 *  THEME CONSTANTS
 *  Premium dark theme with gradients, glassmorphism, and
 *  semantic colors. Used throughout the entire application.
 *
 *  Usage:
 *    import { COLORS, GRADIENTS, GLASS, SPACING, RADIUS } from '@/constants/theme';
 * ============================================================
 */

// ─── Background Colors (Layered Depth) ──────────────────────
export const COLORS = {
  // Backgrounds -- darkest to lightest
  bgPrimary: '#0A0A0F', // Main app background (near-black with blue tint)
  bgSecondary: '#12121A', // Slightly elevated surfaces
  bgTertiary: '#1A1A2E', // Cards, panels (dark navy)
  bgElevated: '#2D1B4E', // Modals, popovers (dark purple)

  // Brand / Accent
  accentPrimary: '#6366F1', // Indigo -- main brand color
  accentSecondary: '#A855F7', // Purple -- secondary accent
  accentTertiary: '#EC4899', // Pink -- tertiary accent
  accentCyan: '#06B6D4', // Cyan -- energetic accent

  // Text
  textPrimary: '#F1F5F9', // Off-white (NOT pure white -- easier on eyes)
  textSecondary: '#94A3B8', // Slate gray
  textTertiary: '#64748B', // Muted gray
  textOnGradient: '#FFFFFF', // Pure white for gradient backgrounds

  // Semantic
  success: '#10B981', // Emerald
  successLight: '#34D399',
  warning: '#F59E0B', // Amber
  warningLight: '#FBBF24',
  error: '#EF4444', // Red
  errorLight: '#F87171',
  recording: '#EF4444', // Solid red for recording state

  // Glass
  glassBg: 'rgba(26, 26, 46, 0.6)', // Semi-transparent dark navy
  glassBorder: 'rgba(99, 102, 241, 0.15)', // Indigo at 15% opacity
  glassHighlight: 'rgba(255, 255, 255, 0.05)', // Subtle inner glow
  glassBackdrop: 'rgba(0, 0, 0, 0.5)', // Backdrop overlay

  // Borders
  border: 'rgba(255, 255, 255, 0.08)', // Subtle white border
  borderActive: 'rgba(99, 102, 241, 0.4)', // Indigo active border

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)', // 50% black overlay
  overlayLight: 'rgba(0, 0, 0, 0.3)', // 30% black overlay
  overlayHeavy: 'rgba(0, 0, 0, 0.7)', // 70% black overlay
} as const;

// ─── Gradient Presets ────────────────────────────────────────
// Each gradient is an array of [startColor, endColor] for LinearGradient
export const GRADIENTS = {
  // Primary button/CTA gradient
  primary: ['#6366F1', '#A855F7'] as const, // Indigo -> Purple

  // Secondary accent gradient
  accent: ['#A855F7', '#EC4899'] as const, // Purple -> Pink

  // Energetic/special actions
  energetic: ['#6366F1', '#06B6D4'] as const, // Indigo -> Cyan

  // Record button / warm actions
  warm: ['#F59E0B', '#EF4444'] as const, // Amber -> Red

  // Card/surface backgrounds
  surface: ['#1A1A2E', '#2D1B4E'] as const, // Dark navy -> Dark purple

  // Success state
  success: ['#10B981', '#34D399'] as const, // Emerald gradient

  // Error state
  error: ['#EF4444', '#F87171'] as const, // Red gradient

  // Warning state
  warning: ['#F59E0B', '#FBBF24'] as const, // Amber gradient

  // Text heading gradient
  textHeading: ['#A78BFA', '#C4B5FD'] as const, // Lavender

  // Text accent gradient
  textAccent: ['#6366F1', '#EC4899'] as const, // Indigo -> Pink

  // Export progress ring (3 stops)
  progress: ['#6366F1', '#A855F7', '#EC4899'] as const, // Indigo -> Purple -> Pink

  // Recording progress bar
  recording: ['#EF4444', '#F97316'] as const, // Red -> Orange
} as const;

// ─── Glassmorphism Configuration ─────────────────────────────
export const GLASS = {
  blurIntensity: 20,
  blurIntensityStrong: 30,
  blurIntensityLight: 12,
  borderWidth: 1,
  borderRadius: 16,
} as const;

// ─── Spacing Scale ───────────────────────────────────────────
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

// ─── Border Radius Scale ─────────────────────────────────────
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ─── Typography Scale ────────────────────────────────────────
export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

// ─── Shadow Presets ──────────────────────────────────────────
export const SHADOWS = {
  // Subtle glow for elevated surfaces
  glow: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  // Soft elevation shadow
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  // Subtle card shadow
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

// ─── Animation Defaults ─────────────────────────────────────
export const ANIMATION = {
  // Spring configs for withSpring
  spring: {
    button: { stiffness: 400, damping: 15 },
    bottomSheet: { stiffness: 300, damping: 25 },
    pill: { stiffness: 350, damping: 20 },
    gentle: { stiffness: 200, damping: 20 },
  },
  // Scale values for press animations
  pressScale: 0.95,
  pressScaleSmall: 0.9,
  pressOpacity: 0.8,
  // Timing durations
  duration: {
    fast: 150,
    normal: 250,
    slow: 400,
    shimmer: 1500,
    countdown: 800,
  },
} as const;

// ─── Layout Constants ────────────────────────────────────────
export const LAYOUT = {
  // Editor screen
  videoPreviewRatio: 0.55, // 55% of screen height
  timelineHeight: 100,
  toolTabBarHeight: 56,
  bottomSheetMaxRatio: 0.4, // 40% of screen

  // Camera screen
  recordButtonSize: 72,
  recordButtonInnerSize: 64,
  controlButtonSize: 44,

  // Timeline
  thumbnailWidth: 48,
  thumbnailHeight: 85, // 9:16 ratio at 48px width
  playheadWidth: 2,
  trimHandleWidth: 16,

  // General
  iconSize: 22,
  iconSizeLarge: 28,
  hitSlop: 8,
} as const;
