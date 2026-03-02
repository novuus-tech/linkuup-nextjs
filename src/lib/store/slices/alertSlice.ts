'use client';

import { createSlice } from '@reduxjs/toolkit';

interface AlertState {
  message: string | null;
  type: 'success' | 'error' | null;
}

const initialState: AlertState = {
  message: null,
  type: null,
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    success: (state, action) => {
      state.message = action.payload;
      state.type = 'success';
    },
    error: (state, action) => {
      state.message = action.payload;
      state.type = 'error';
    },
    clear: (state) => {
      state.message = null;
      state.type = null;
    },
  },
});

export const { success, error, clear } = alertSlice.actions;
export default alertSlice.reducer;
