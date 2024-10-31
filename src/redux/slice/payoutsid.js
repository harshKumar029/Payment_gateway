// slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    fetchDataSuccess(state, action) {
      state.push(action.payload);
    },
  },
});

export const { fetchDataSuccess } = dataSlice.actions;

export default dataSlice.reducer;