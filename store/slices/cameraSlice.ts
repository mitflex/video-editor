import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { CountdownValue, DurationValue } from '@/constants/filters';

// ─── Camera State ───────────────────────────────────────────
interface CameraState {
  facing: 'front' | 'back';
  flashMode: 'off' | 'on';
  isRecording: boolean;
  isPaused: boolean;
  recordingDurationMs: number;
  maxDuration: DurationValue;
  countdownDuration: CountdownValue;
  countdownRemaining: number;
  showGrid: boolean;
  recordedSegments: string[];
}

const initialState: CameraState = {
  facing: 'back',
  flashMode: 'off',
  isRecording: false,
  isPaused: false,
  recordingDurationMs: 0,
  maxDuration: 30,
  countdownDuration: 0,
  countdownRemaining: 0,
  showGrid: false,
  recordedSegments: [],
};

const cameraSlice = createSlice({
  name: 'camera',
  initialState,
  reducers: {
    toggleFacing(state) {
      state.facing = state.facing === 'back' ? 'front' : 'back';
      // Front cameras don't have flash
      if (state.facing === 'front') {
        state.flashMode = 'off';
      }
    },
    setFlashMode(state, action: PayloadAction<'off' | 'on'>) {
      state.flashMode = action.payload;
    },
    setIsRecording(state, action: PayloadAction<boolean>) {
      state.isRecording = action.payload;
      if (!action.payload) {
        state.isPaused = false;
      }
    },
    setIsPaused(state, action: PayloadAction<boolean>) {
      state.isPaused = action.payload;
    },
    setRecordingDuration(state, action: PayloadAction<number>) {
      state.recordingDurationMs = action.payload;
    },
    setMaxDuration(state, action: PayloadAction<DurationValue>) {
      state.maxDuration = action.payload;
    },
    setCountdownDuration(state, action: PayloadAction<CountdownValue>) {
      state.countdownDuration = action.payload;
    },
    setCountdownRemaining(state, action: PayloadAction<number>) {
      state.countdownRemaining = action.payload;
    },
    toggleGrid(state) {
      state.showGrid = !state.showGrid;
    },
    addSegment(state, action: PayloadAction<string>) {
      state.recordedSegments.push(action.payload);
    },
    clearSegments(state) {
      state.recordedSegments = [];
    },
    resetCamera(state) {
      Object.assign(state, {
        ...initialState,
        // Preserve user preferences across recordings
        maxDuration: state.maxDuration,
        countdownDuration: state.countdownDuration,
        showGrid: state.showGrid,
      });
    },
  },
});

export const {
  toggleFacing,
  setFlashMode,
  setIsRecording,
  setIsPaused,
  setRecordingDuration,
  setMaxDuration,
  setCountdownDuration,
  setCountdownRemaining,
  toggleGrid,
  addSegment,
  clearSegments,
  resetCamera,
} = cameraSlice.actions;

export default cameraSlice.reducer;
