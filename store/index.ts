import { configureStore } from '@reduxjs/toolkit';
import cameraReducer from './slices/cameraSlice';
import exportReducer from './slices/exportSlice';
import projectReducer from './slices/projectSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    export: exportReducer,
    camera: cameraReducer,
    project: projectReducer,
    // Additional slices will be added as sprints progress:
    // timeline: timelineReducer,   -- Sprint 4
    // transform: transformReducer, -- Sprint 5
    // filter: filterReducer,       -- Sprint 6
    // audio: audioReducer,         -- Sprint 7
    // overlay: overlayReducer,     -- Sprint 8
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
