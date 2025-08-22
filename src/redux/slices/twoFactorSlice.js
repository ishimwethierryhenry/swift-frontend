// src/redux/slices/twoFactorSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

const API_URL = import.meta.env.VITE_APP_API_URL || "https://swift-backend-88o8.onrender.com";

// Async thunks for 2FA operations
export const setup2FA = createAsyncThunk(
  "twoFactor/setup",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/two-factor/setup`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to setup 2FA"
      );
    }
  }
);

export const enable2FA = createAsyncThunk(
  "twoFactor/enable",
  async (verificationCode, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/two-factor/enable`,
        { token: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to enable 2FA"
      );
    }
  }
);

export const verify2FA = createAsyncThunk(
  "twoFactor/verify",
  async ({ userId, token, isBackupCode = false }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/two-factor/verify`, {
        userId,
        token,
        isBackupCode,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid verification code"
      );
    }
  }
);

export const get2FAStatus = createAsyncThunk(
  "twoFactor/getStatus",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/two-factor/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get 2FA status"
      );
    }
  }
);

export const disable2FA = createAsyncThunk(
  "twoFactor/disable",
  async (password, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/two-factor/disable`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to disable 2FA"
      );
    }
  }
);

export const regenerateBackupCodes = createAsyncThunk(
  "twoFactor/regenerateBackupCodes",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/two-factor/regenerate-backup-codes`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to regenerate backup codes"
      );
    }
  }
);

export const addTrustedDevice = createAsyncThunk(
  "twoFactor/addTrustedDevice",
  async ({ deviceFingerprint, deviceName }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/two-factor/trusted-devices`,
        { deviceFingerprint, deviceName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add trusted device"
      );
    }
  }
);

export const removeTrustedDevice = createAsyncThunk(
  "twoFactor/removeTrustedDevice",
  async (deviceFingerprint, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/two-factor/trusted-devices/${deviceFingerprint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove trusted device"
      );
    }
  }
);

export const getTrustedDevices = createAsyncThunk(
  "twoFactor/getTrustedDevices",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/two-factor/trusted-devices`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get trusted devices"
      );
    }
  }
);

const twoFactorSlice = createSlice({
  name: "twoFactor",
  initialState: {
    // Setup and enable
    setupLoading: false,
    setupData: null,
    setupError: null,
    
    enableLoading: false,
    enableSuccess: false,
    enableError: null,
    backupCodes: [],
    
    // Verification
    verifyLoading: false,
    verifySuccess: false,
    verifyError: null,
    
    // Status
    statusLoading: false,
    statusError: null,
    enabled: false,
    backupCodesRemaining: 0,
    hasSecret: false,
    
    // Disable
    disableLoading: false,
    disableSuccess: false,
    disableError: null,
    
    // Backup codes
    regenerateLoading: false,
    regenerateSuccess: false,
    regenerateError: null,
    
    // Trusted devices
    trustedDevices: [],
    trustedDevicesLoading: false,
    trustedDevicesError: null,
    addDeviceLoading: false,
    addDeviceError: null,
    removeDeviceLoading: false,
    removeDeviceError: null,
  },
  reducers: {
    clear2FAState: (state) => {
      state.setupLoading = false;
      state.setupData = null;
      state.setupError = null;
      state.enableLoading = false;
      state.enableSuccess = false;
      state.enableError = null;
      state.backupCodes = [];
      state.verifyLoading = false;
      state.verifySuccess = false;
      state.verifyError = null;
      state.disableLoading = false;
      state.disableSuccess = false;
      state.disableError = null;
      state.regenerateLoading = false;
      state.regenerateSuccess = false;
      state.regenerateError = null;
    },
    
    clear2FAErrors: (state) => {
      state.setupError = null;
      state.enableError = null;
      state.verifyError = null;
      state.statusError = null;
      state.disableError = null;
      state.regenerateError = null;
      state.trustedDevicesError = null;
      state.addDeviceError = null;
      state.removeDeviceError = null;
    },
    
    reset2FAFlags: (state) => {
      state.enableSuccess = false;
      state.verifySuccess = false;
      state.disableSuccess = false;
      state.regenerateSuccess = false;
    },
    
    setBackupCodes: (state, action) => {
      state.backupCodes = action.payload;
    },
    
    clearSetupData: (state) => {
      state.setupData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Setup 2FA
      .addCase(setup2FA.pending, (state) => {
        state.setupLoading = true;
        state.setupError = null;
      })
      .addCase(setup2FA.fulfilled, (state, action) => {
        state.setupLoading = false;
        state.setupData = action.payload.data;
        state.setupError = null;
      })
      .addCase(setup2FA.rejected, (state, action) => {
        state.setupLoading = false;
        state.setupError = action.payload;
      })
      
      // Enable 2FA
      .addCase(enable2FA.pending, (state) => {
        state.enableLoading = true;
        state.enableError = null;
      })
      .addCase(enable2FA.fulfilled, (state, action) => {
        state.enableLoading = false;
        state.enableSuccess = true;
        state.enabled = true;
        state.backupCodes = action.payload.data.backupCodes || [];
        state.enableError = null;
        state.setupData = null; // Clear setup data after successful enable
      })
      .addCase(enable2FA.rejected, (state, action) => {
        state.enableLoading = false;
        state.enableError = action.payload;
      })
      
      // Verify 2FA
      .addCase(verify2FA.pending, (state) => {
        state.verifyLoading = true;
        state.verifyError = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.verifySuccess = true;
        state.verifyError = null;
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.verifyLoading = false;
        state.verifyError = action.payload;
      })
      
      // Get 2FA Status
      .addCase(get2FAStatus.pending, (state) => {
        state.statusLoading = true;
        state.statusError = null;
      })
      .addCase(get2FAStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.enabled = action.payload.data.enabled;
        state.backupCodesRemaining = action.payload.data.backupCodesRemaining;
        state.hasSecret = action.payload.data.hasSecret;
        state.statusError = null;
      })
      .addCase(get2FAStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError = action.payload;
      })
      
      // Disable 2FA
      .addCase(disable2FA.pending, (state) => {
        state.disableLoading = true;
        state.disableError = null;
      })
      .addCase(disable2FA.fulfilled, (state, action) => {
        state.disableLoading = false;
        state.disableSuccess = true;
        state.enabled = false;
        state.backupCodes = [];
        state.backupCodesRemaining = 0;
        state.hasSecret = false;
        state.disableError = null;
      })
      .addCase(disable2FA.rejected, (state, action) => {
        state.disableLoading = false;
        state.disableError = action.payload;
      })
      
      // Regenerate Backup Codes
      .addCase(regenerateBackupCodes.pending, (state) => {
        state.regenerateLoading = true;
        state.regenerateError = null;
      })
      .addCase(regenerateBackupCodes.fulfilled, (state, action) => {
        state.regenerateLoading = false;
        state.regenerateSuccess = true;
        state.backupCodes = action.payload.data.backupCodes;
        state.backupCodesRemaining = action.payload.data.backupCodes.length;
        state.regenerateError = null;
      })
      .addCase(regenerateBackupCodes.rejected, (state, action) => {
        state.regenerateLoading = false;
        state.regenerateError = action.payload;
      })
      
      // Add Trusted Device
      .addCase(addTrustedDevice.pending, (state) => {
        state.addDeviceLoading = true;
        state.addDeviceError = null;
      })
      .addCase(addTrustedDevice.fulfilled, (state, action) => {
        state.addDeviceLoading = false;
        state.addDeviceError = null;
        // Refresh trusted devices list
        if (action.payload.data.device) {
          state.trustedDevices.push(action.payload.data.device);
        }
      })
      .addCase(addTrustedDevice.rejected, (state, action) => {
        state.addDeviceLoading = false;
        state.addDeviceError = action.payload;
      })
      
      // Remove Trusted Device
      .addCase(removeTrustedDevice.pending, (state) => {
        state.removeDeviceLoading = true;
        state.removeDeviceError = null;
      })
      .addCase(removeTrustedDevice.fulfilled, (state, action) => {
        state.removeDeviceLoading = false;
        state.removeDeviceError = null;
        // Remove device from list (will be refreshed by getTrustedDevices)
      })
      .addCase(removeTrustedDevice.rejected, (state, action) => {
        state.removeDeviceLoading = false;
        state.removeDeviceError = action.payload;
      })
      
      // Get Trusted Devices
      .addCase(getTrustedDevices.pending, (state) => {
        state.trustedDevicesLoading = true;
        state.trustedDevicesError = null;
      })
      .addCase(getTrustedDevices.fulfilled, (state, action) => {
        state.trustedDevicesLoading = false;
        state.trustedDevices = action.payload.data.trustedDevices || [];
        state.trustedDevicesError = null;
      })
      .addCase(getTrustedDevices.rejected, (state, action) => {
        state.trustedDevicesLoading = false;
        state.trustedDevicesError = action.payload;
      });
  },
});

export const { 
  clear2FAState, 
  clear2FAErrors, 
  reset2FAFlags, 
  setBackupCodes, 
  clearSetupData 
} = twoFactorSlice.actions;

export default twoFactorSlice.reducer;