/**
 * ============================================================
 *  TYPE EXPORTS
 *  Re-exports all type definitions from a single entry point.
 *
 *  Usage:
 *    import type { VideoMetadata, TextOverlay, Project } from '@/types';
 * ============================================================
 */

export type {
  VideoMetadata,
  TrimRange,
  CropRect,
  VideoTransform,
  AdjustmentValues,
  AudioConfig,
  ExportConfig,
  ExportStatus,
  ExportResult,
  VideoValidation,
} from './video';

export { EXPORT_RESOLUTIONS } from './video';

export type { Project, ProjectSource, CreateProjectParams } from './project';

export type { TextOverlay, TextStyleOptions, TextColor } from './overlay';

export { TEXT_COLOR_PALETTE } from './overlay';
