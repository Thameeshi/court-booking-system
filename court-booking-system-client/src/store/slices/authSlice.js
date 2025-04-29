// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  web3auth: null,
  provider: null,
  web3Authorized: false,
  loading: false,
  userInfo: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setWeb3auth: (state, action) => {
      state.web3auth = action.payload;
    },
    setProvider: (state, action) => {
      state.provider = action.payload;
    },
    setWeb3Authorized: (state, action) => {
      state.web3Authorized = action.payload;
    },
    logout: (state) => {
      state.web3auth = null;
      state.provider = null;
      state.web3Authorized = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    }
  },
});

export const { setWeb3auth, setProvider, setWeb3Authorized, logout, setLoading, setUserInfo } = authSlice.actions;
export default authSlice.reducer;