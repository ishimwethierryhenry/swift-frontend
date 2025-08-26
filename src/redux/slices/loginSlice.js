import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import tokenDec from "../../helpers/tokenDec";
import { userActions } from "./userSlice";
import { capitalizeFirstLetter } from "../../helpers/capitalCase";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

// Replace the auth thunk in your loginSlice.js (around line 10-80)
export const auth = createAsyncThunk(
  "users/login",
  async (submitData, { dispatch }) => {
    try {
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/users/login`, // ✅ FIXED: Added /api prefix
        data: { email: submitData.email, pwd: submitData.pwd },
      });

      console.log('🔍 Frontend received response:', response.data);

      if (response.status == 200) {
        const { token, user, message, redirectTo, requires2FA } = response.data;

        console.log('🔍 Token received:', token);
        console.log('🔍 User data received:', user);
        console.log('🔍 2FA required:', requires2FA);
        console.log('🔍 First login status:', user?.isFirstLogin);

        // 🆕 If 2FA is required, return the response without storing token yet
        if (requires2FA) {
          console.log('🔒 2FA verification required, not storing token yet');
          return {
            ...response.data,
            requires2FA: true,
            user,
            message: message || "2FA verification required"
          };
        }

        // Normal login flow (no 2FA required)
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("authToken", token); // Also store as authToken

          // 🆕 Store user data directly from response (includes isFirstLogin)
          if (user) {
            dispatch(userActions.setUserData(user));

            let str = `${capitalizeFirstLetter(
              user.fname
            )} ${capitalizeFirstLetter(user.lname)}`;
            
            localStorage.setItem("user_id", user.id);
            localStorage.setItem("user_role", user.role);
            localStorage.setItem("user_location", user.location);
            localStorage.setItem("user_name", str);
            localStorage.setItem("user_email", user.email); // ✅ Store email
            localStorage.setItem("user", JSON.stringify(user)); // 🆕 Store full user object

            // 🆕 Show appropriate message for first login
            if (user.isFirstLogin) {
              toast.warning("Welcome! Please change your password to continue.");
            } else {
              toast.success(message || `Welcome back, ${user.fname}!`);
            }

            return { 
              ...response.data, 
              user,
              isFirstLogin: user.isFirstLogin,
              redirectTo,
              requires2FA: false
            };
          }

          // Fallback to token decoding if user not in response
          const data = tokenDec(token);
          console.log('🔍 Decoded token data:', data);

          if (data) {
            dispatch(userActions.setUserData(data.user));

            let str = `${capitalizeFirstLetter(
              data.user.fname
            )} ${capitalizeFirstLetter(data.user.lname)}`;
            localStorage.setItem("user_id", data.user.id);
            localStorage.setItem("user_role", data.user.role);
            localStorage.setItem("user_location", data.user.location);
            localStorage.setItem("user_name", str);
            localStorage.setItem("user_email", data.user.email);

            return { ...response.data, requires2FA: false };
          }
        }
        return null;
      }
    } catch (error) {
      console.log(error);
      
      // 🔄 Enhanced error handling
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Signin failed: ${errorMessage}`);
      
      // Handle account locked specifically
      if (error.response?.status === 423) {
        const lockInfo = error.response.data;
        toast.error(`Account locked. ${lockInfo.message}`);
      }
      
      throw error;
    }
  }
);

// Also fix the changeFirstLoginPassword thunk (around line 85)
export const changeFirstLoginPassword = createAsyncThunk(
  "users/changeFirstLoginPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/password/force-change`, // ✅ FIXED: Added /api prefix
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        data: passwordData,
      });

      if (response.status === 200) {
        toast.success("Password changed successfully! Welcome to SWIFT!");
        
        // Update stored user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          isFirstLogin: false,
          requiresPasswordChange: false,
          passwordChangedAt: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { 
          ...response.data,
          user: updatedUser 
        };
      }
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Password change failed: ${errorMessage}`);
      return rejectWithValue(errorMessage);
    }
  }
);

// 🆕 NEW: Logout thunk to clean up everything
export const logout = createAsyncThunk(
  "users/logout",
  async (_, { dispatch }) => {
    try {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_location");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user");
      
      // Clear user data from store
      dispatch(userActions.clearUserData());
      
      toast.info("Logged out successfully");
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
    // 🆕 NEW: User state for better tracking
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isFirstLogin: JSON.parse(localStorage.getItem('user'))?.isFirstLogin || false,
  },
  reducers: {
    setRole(state, action) {
      state.role = action.payload;
    },
    clearLoginState(state) {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
    // 🆕 NEW: Clear all authentication state
    clearAuth(state) {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
      state.user = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
    },
    // 🆕 NEW: Update first login status
    updateFirstLoginStatus(state, action) {
      if (state.user) {
        state.user.isFirstLogin = action.payload;
        state.user.requiresPasswordChange = action.payload;
        state.isFirstLogin = action.payload;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    // 🆕 NEW: Set user data directly
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isFirstLogin = action.payload?.isFirstLogin || false;
      
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    // 🆕 NEW: Clear error state
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Original login cases
    builder.addCase(auth.pending, (state) => {
      state.loading = true;
      state.serverResponded = false;
      state.error = null;
    });
    builder.addCase(auth.fulfilled, (state, action) => {
      state.loading = false;
      state.response = { ...action.payload };
      state.error = null;
      state.serverResponded = action.payload ? true : false;
      
      // 🆕 Update user state from response
      if (action.payload?.user) {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isFirstLogin = action.payload.user.isFirstLogin || false;
      }
    });
    builder.addCase(auth.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = true;
      state.isAuthenticated = false;
      state.user = null;
    });

    // 🆕 Force password change cases
    builder.addCase(changeFirstLoginPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(changeFirstLoginPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      
      // Update user's first login status
      if (state.user) {
        state.user.isFirstLogin = false;
        state.user.requiresPasswordChange = false;
        state.user.passwordChangedAt = new Date().toISOString();
        state.isFirstLogin = false;
      }
    });
    builder.addCase(changeFirstLoginPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error.message;
    });

    // 🆕 Logout cases
    builder.addCase(logout.fulfilled, (state) => {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
      state.user = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
    });
  },
});

export const loginActions = {
  ...loginSlice.actions,
  // Export thunks as actions for easy access
  auth,
  changeFirstLoginPassword,
  logout
};

export default loginSlice.reducer;