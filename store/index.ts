import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    // Additional slices will be added as sprints progress:
    // camera: cameraReducer,       -- Sprint 2
    // project: projectReducer,     -- Sprint 3
    // timeline: timelineReducer,   -- Sprint 4
    // transform: transformReducer, -- Sprint 5
    // filter: filterReducer,       -- Sprint 6
    // audio: audioReducer,         -- Sprint 7
    // overlay: overlayReducer,     -- Sprint 8
    // export: exportReducer,       -- Sprint 9
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
