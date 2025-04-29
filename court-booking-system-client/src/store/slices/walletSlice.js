// src/store/slices/walletSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  xrplAccount: null,
  xrpBalance: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setXrplAccount: (state, action) => {
      state.xrplAccount = action.payload;
    },
    setXrpBalance: (state, action) => {
      state.xrpBalance = action.payload;
    },
  },
});

export const { setXrplAccount, setXrpBalance } = walletSlice.actions;
export default walletSlice.reducer;