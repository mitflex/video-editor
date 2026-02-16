import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { ExportConfig, ExportResult, ExportStatus } from '@/types/video';

// ─── Export State ───────────────────────────────────────────
interface ExportState {
  status: ExportStatus;
  progress: number;
  resolution: ExportConfig['resolution'];
  outputUri: string | null;
  fileSize: number | null;
  error: string | null;
}

const initialState: ExportState = {
  status: 'idle',
  progress: 0,
  resolution: '1080p',
  outputUri: null,
  fileSize: null,
  error: null,
};

const exportSlice = createSlice({
  name: 'export',
  initialState,
  reducers: {
    setExportStatus(state, action: PayloadAction<ExportStatus>) {
      state.status = action.payload;
    },
    setExportProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    setResolution(state, action: PayloadAction<ExportConfig['resolution']>) {
      state.resolution = action.payload;
    },
    setExportResult(state, action: PayloadAction<ExportResult>) {
      state.status = 'complete';
      state.progress = 1;
      state.outputUri = action.payload.outputUri;
      state.fileSize = action.payload.fileSize;
      state.error = null;
    },
    setExportError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    resetExport(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setExportStatus,
  setExportProgress,
  setResolution,
  setExportResult,
  setExportError,
  resetExport,
} = exportSlice.actions;

export default exportSlice.reducer;
