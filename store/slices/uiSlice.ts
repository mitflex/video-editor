import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark';
  counter: number;
}

const initialState: UiState = {
  theme: 'light',
  counter: 0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    increment(state) {
      state.counter += 1;
    },
    decrement(state) {
      state.counter -= 1;
    },
    setCounter(state, action: PayloadAction<number>) {
      state.counter = action.payload;
    },
  },
});

export const { toggleTheme, increment, decrement, setCounter } = uiSlice.actions;
export default uiSlice.reducer;
