/**
 * ============================================================
 *  Project Slice
 *  Manages the current editing project state including source
 *  video, metadata, thumbnails, and trim range.
 *
 *  Lifecycle:
 *    1. User imports/records a video → createProject
 *    2. Metadata extracted → setSourceMetadata
 *    3. Thumbnails generated → setThumbnails
 *    4. User selects trim range → setTrimRange
 *    5. Project cleared on exit → resetProject
 * ============================================================
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { VideoMetadata, TrimRange } from '@/types/video';
import type { ProjectSource } from '@/types/project';

// ─── Project State ─────────────────────────────────────────────

interface ProjectState {
  /** Unique project ID (timestamp-based) */
  id: string | null;
  /** Source video URI (camera recording or gallery import) */
  sourceUri: string | null;
  /** How the video was sourced */
  source: ProjectSource | null;
  /** Metadata extracted from source video */
  sourceMetadata: VideoMetadata | null;
  /** Generated timeline thumbnail URIs */
  thumbnails: string[];
  /** User-selected trim range (null = full video) */
  trimRange: TrimRange | null;
  /** Whether metadata is being loaded */
  isLoadingMetadata: boolean;
  /** Whether thumbnails are being generated */
  isGeneratingThumbnails: boolean;
  /** Error message if any */
  error: string | null;
}

const initialState: ProjectState = {
  id: null,
  sourceUri: null,
  source: null,
  sourceMetadata: null,
  thumbnails: [],
  trimRange: null,
  isLoadingMetadata: false,
  isGeneratingThumbnails: false,
  error: null,
};

// ─── Slice ─────────────────────────────────────────────────────

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    createProject(
      state,
      action: PayloadAction<{ sourceUri: string; source: ProjectSource; id?: string }>
    ) {
      const { sourceUri, source, id } = action.payload;
      state.id = id ?? `proj_${Date.now()}`;
      state.sourceUri = sourceUri;
      state.source = source;
      state.sourceMetadata = null;
      state.thumbnails = [];
      state.trimRange = null;
      state.error = null;
    },

    setSourceMetadata(state, action: PayloadAction<VideoMetadata>) {
      state.sourceMetadata = action.payload;
      state.isLoadingMetadata = false;
    },

    setLoadingMetadata(state, action: PayloadAction<boolean>) {
      state.isLoadingMetadata = action.payload;
    },

    setThumbnails(state, action: PayloadAction<string[]>) {
      state.thumbnails = action.payload;
      state.isGeneratingThumbnails = false;
    },

    setGeneratingThumbnails(state, action: PayloadAction<boolean>) {
      state.isGeneratingThumbnails = action.payload;
    },

    setTrimRange(state, action: PayloadAction<TrimRange | null>) {
      state.trimRange = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoadingMetadata = false;
      state.isGeneratingThumbnails = false;
    },

    resetProject() {
      return { ...initialState };
    },
  },
});

export const {
  createProject,
  setSourceMetadata,
  setLoadingMetadata,
  setThumbnails,
  setGeneratingThumbnails,
  setTrimRange,
  setError,
  resetProject,
} = projectSlice.actions;

export default projectSlice.reducer;
