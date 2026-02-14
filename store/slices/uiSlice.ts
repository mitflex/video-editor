import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ─── Editor Tool Tabs ────────────────────────────────────────
export type EditorTool =
  | 'trim'
  | 'split'
  | 'crop'
  | 'rotate'
  | 'speed'
  | 'filters'
  | 'adjust'
  | 'audio'
  | 'text';

// ─── UI State ────────────────────────────────────────────────
interface UiState {
  theme: 'dark'; // Dark-only for MVP
  activeModal: string | null;
  activeToolTab: EditorTool | null;
  isLoading: boolean;
  loadingMessage: string | null;
}

const initialState: UiState = {
  theme: 'dark',
  activeModal: null,
  activeToolTab: null,
  isLoading: false,
  loadingMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
    setActiveToolTab(state, action: PayloadAction<EditorTool | null>) {
      state.activeToolTab = action.payload;
    },
    setLoading(state, action: PayloadAction<{ isLoading: boolean; message?: string }>) {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message ?? null;
    },
  },
});

export const { setActiveModal, setActiveToolTab, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
