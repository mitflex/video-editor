/**
 * ============================================================
 *  ROUTE REGISTRY
 *  Centralized route definitions for the entire application.
 *  Use these constants everywhere instead of hardcoded strings.
 *
 *  Usage:
 *    import { ROUTES } from '@/constants/routes';
 *    router.push(ROUTES.CAMERA);
 *    router.replace(ROUTES.EDITOR);
 *    <Link href={ROUTES.HOME}>
 * ============================================================
 */

// ─── Route Groups ────────────────────────────────────────────
//
// (tabs)   — Home tab navigator (main landing)
// camera   — Camera recording flow: record -> preview
// import   — Video import flow: gallery pick -> clip selector
// editor   — Main editing workspace
// export   — Export progress + social sharing
//

export const ROUTES = {
  // ── Tab Routes ──────────────────────────────────────────────
  HOME: '/(tabs)',

  // ── Camera Flow ─────────────────────────────────────────────
  CAMERA: '/camera',
  CAMERA_PREVIEW: '/camera/preview',

  // ── Import Flow ─────────────────────────────────────────────
  IMPORT: '/import',
  CLIP_SELECTOR: '/import/clip-selector',

  // ── Editor ──────────────────────────────────────────────────
  EDITOR: '/editor',

  // ── Export & Share ──────────────────────────────────────────
  EXPORT: '/export',
} as const;

// ─── TypeScript Helpers ──────────────────────────────────────
/** Union of all route key names (e.g. 'HOME' | 'CAMERA' | ...) */
export type RouteName = keyof typeof ROUTES;

/** Union of all route path strings (e.g. '/(tabs)' | '/camera' | ...) */
export type RoutePath = (typeof ROUTES)[RouteName];
