import { configureStore } from '@reduxjs/toolkit';
import exportReducer from './slices/exportSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    export: exportReducer,
    // Additional slices will be added as sprints progress:
    // camera: cameraReducer,       -- Sprint 2
    // project: projectReducer,     -- Sprint 3
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
