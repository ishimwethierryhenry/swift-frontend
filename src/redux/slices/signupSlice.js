// src/redux/slices/signupSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk for user signup
export const signup = createAsyncThunk(
  "signup/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL || "https://swift-backend-88o8.onrender.com"}/users/signup`,
        userData
      );
      // const response = await axios.post(
      //   `${import.meta.env.VITE_APP_API_URL || "https://swift-backend-88o8.onrender.com"}/users/signup`,
      //   userData
      // );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.validationError || 
        "Signup failed. Please try again."
      );
    }
  }
);

const signupSlice = createSlice({
  name: "signup",
  initialState: {
    loading: false,
    success: false,
    error: null,
    user: null,
    serverResponded: false,
  },
  reducers: {
    clearSignupState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.user = null;
      state.serverResponded = false;
    },
    resetSignupError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.serverResponded = false;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.serverResponded = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.serverResponded = true;
      });
  },
});

export const { clearSignupState, resetSignupError } = signupSlice.actions;
export default signupSlice.reducer;