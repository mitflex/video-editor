import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import uiReducer from './slices/uiSlice';
import { sampleApi } from './api/sampleApi';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [sampleApi.reducerPath]: sampleApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sampleApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
