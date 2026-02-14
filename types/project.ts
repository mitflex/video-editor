/**
 * ============================================================
 *  PROJECT TYPES
 *  Type definitions for the video editing project state.
 * ============================================================
 */

import type { VideoMetadata, TrimRange } from './video';

// ─── Project ─────────────────────────────────────────────────
export interface Project {
  /** Unique project identifier */
  id: string;
  /** Original source video URI */
  sourceUri: string;
  /** Video metadata extracted from source */
  sourceMetadata: VideoMetadata;
  /** Generated timeline thumbnail URIs */
  thumbnails: string[];
  /** User-selected trim range (null = full video) */
  trimRange: TrimRange | null;
  /** When the project was created */
  createdAt: number;
  /** When the project was last modified */
  updatedAt: number;
}

// ─── Project Source ──────────────────────────────────────────
export type ProjectSource = 'camera' | 'gallery';

// ─── Project Creation Params ─────────────────────────────────
export interface CreateProjectParams {
  sourceUri: string;
  source: ProjectSource;
  trimRange?: TrimRange;
}
