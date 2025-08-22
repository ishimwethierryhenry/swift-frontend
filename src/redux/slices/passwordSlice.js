// src/redux/slices/passwordSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

const API_URL = import.meta.env.VITE_APP_API_URL || "https://swift-backend-88o8.onrender.com";

// Async thunks for password operations
export const requestPasswordReset = createAsyncThunk(
  "password/requestReset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/password/forgot`, { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send reset email"
      );
    }
  }
);

export const verifyResetToken = createAsyncThunk(
  "password/verifyResetToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/password/verify-reset-token/${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid or expired token"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "password/resetPassword",
  async ({ token, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/password/reset/${token}`, {
        newPassword,
        confirmPassword
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "password/changePassword",
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/password/change`,
        { currentPassword, newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);

export const forcePasswordChange = createAsyncThunk(
  "password/forcePasswordChange",
  async ({ newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/password/force-change`,
        { newPassword, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to change password"
      );
    }
  }
);

export const checkPasswordRequirements = createAsyncThunk(
  "password/checkRequirements",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/password/requirements`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check password requirements"
      );
    }
  }
);

const passwordSlice = createSlice({
  name: "password",
  initialState: {
    // Reset password flow
    resetEmailSent: false,
    resetEmailLoading: false,
    resetEmailError: null,
    
    // Token verification
    tokenValid: false,
    tokenLoading: false,
    tokenError: null,
    userInfo: null,
    
    // Password reset
    resetLoading: false,
    resetSuccess: false,
    resetError: null,
    
    // Password change
    changeLoading: false,
    changeSuccess: false,
    changeError: null,
    
    // Force password change (first login)
    forceChangeLoading: false,
    forceChangeSuccess: false,
    forceChangeError: null,
    
    // Requirements check
    requiresPasswordChange: false,
    isFirstLogin: false,
    passwordLastChanged: null,
    lastLogin: null,
    requirementsLoading: false,
    requirementsError: null,
  },
  reducers: {
    clearPasswordState: (state) => {
      state.resetEmailSent = false;
      state.resetEmailLoading = false;
      state.resetEmailError = null;
      state.tokenValid = false;
      state.tokenLoading = false;
      state.tokenError = null;
      state.userInfo = null;
      state.resetLoading = false;
      state.resetSuccess = false;
      state.resetError = null;
      state.changeLoading = false;
      state.changeSuccess = false;
      state.changeError = null;
      state.forceChangeLoading = false;
      state.forceChangeSuccess = false;
      state.forceChangeError = null;
    },
    
    clearPasswordErrors: (state) => {
      state.resetEmailError = null;
      state.tokenError = null;
      state.resetError = null;
      state.changeError = null;
      state.forceChangeError = null;
      state.requirementsError = null;
    },
    
    resetPasswordFlags: (state) => {
      state.resetSuccess = false;
      state.changeSuccess = false;
      state.forceChangeSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.resetEmailLoading = true;
        state.resetEmailError = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.resetEmailLoading = false;
        state.resetEmailSent = true;
        state.resetEmailError = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.resetEmailLoading = false;
        state.resetEmailError = action.payload;
      })
      
      // Verify Reset Token
      .addCase(verifyResetToken.pending, (state) => {
        state.tokenLoading = true;
        state.tokenError = null;
      })
      .addCase(verifyResetToken.fulfilled, (state, action) => {
        state.tokenLoading = false;
        state.tokenValid = true;
        state.userInfo = action.payload.user;
        state.tokenError = null;
      })
      .addCase(verifyResetToken.rejected, (state, action) => {
        state.tokenLoading = false;
        state.tokenValid = false;
        state.tokenError = action.payload;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetError = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetLoading = false;
        state.resetSuccess = true;
        state.resetError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.changeLoading = true;
        state.changeError = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.changeLoading = false;
        state.changeSuccess = true;
        state.changeError = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changeLoading = false;
        state.changeError = action.payload;
      })
      
      // Force Password Change
      .addCase(forcePasswordChange.pending, (state) => {
        state.forceChangeLoading = true;
        state.forceChangeError = null;
      })
      .addCase(forcePasswordChange.fulfilled, (state, action) => {
        state.forceChangeLoading = false;
        state.forceChangeSuccess = true;
        state.forceChangeError = null;
        state.requiresPasswordChange = false;
        state.isFirstLogin = false;
      })
      .addCase(forcePasswordChange.rejected, (state, action) => {
        state.forceChangeLoading = false;
        state.forceChangeError = action.payload;
      })
      
      // Check Password Requirements
      .addCase(checkPasswordRequirements.pending, (state) => {
        state.requirementsLoading = true;
        state.requirementsError = null;
      })
      .addCase(checkPasswordRequirements.fulfilled, (state, action) => {
        state.requirementsLoading = false;
        state.requiresPasswordChange = action.payload.data.requiresPasswordChange;
        state.isFirstLogin = action.payload.data.isFirstLogin;
        state.passwordLastChanged = action.payload.data.passwordLastChanged;
        state.lastLogin = action.payload.data.lastLogin;
        state.requirementsError = null;
      })
      .addCase(checkPasswordRequirements.rejected, (state, action) => {
        state.requirementsLoading = false;
        state.requirementsError = action.payload;
      });
  },
});

export const { 
  clearPasswordState, 
  clearPasswordErrors, 
  resetPasswordFlags 
} = passwordSlice.actions;

export default passwordSlice.reducer;