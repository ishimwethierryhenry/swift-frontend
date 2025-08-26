// =================== UPDATED POOLS BY LOCATION SLICE ===================
// src/redux/slices/poolsByLocationSlice.js - Fixed to properly handle data
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const poolsAvailable = createAsyncThunk(
  "pools/location",
  async (location, { rejectWithValue }) => {
    try {
      const tokenStr = localStorage.getItem("token");
      
      // Debug logging
      console.log('Auth Debug:', {
        hasToken: !!tokenStr,
        tokenLength: tokenStr?.length,
        location: location
      });

      if (!tokenStr) {
        throw new Error('No authentication token found');
      }

      let str = location.trim();
      const locParam = str.replace(" ", "&");

      console.log('Redux Action - Fetching pools for location:', locParam);
      console.log('Redux Action - Request URL:', `${SERVER_URL}/pools/${locParam}`);

      const response = await axios({
        method: "get",
        url: `${SERVER_URL}/pools/${locParam}`,
        headers: { 
          Authorization: `Bearer ${tokenStr}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Redux Action - API Response:', response.data);

      if (response.status === 200) {
        const pools = response.data.allPools || [];
        console.log('Redux Action - Returning pools:', pools);
        return pools; // Return the pools array directly
      }
      
      return []; // Return empty array if no data
    } catch (error) {
      console.error('Redux Action - Full Error:', error);
      console.error('Redux Action - Error Response:', error.response?.data);
      console.error('Redux Action - Error Status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to fetch pools";
      
      toast.error(`Error loading pools: ${errorMessage}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      
      return rejectWithValue(errorMessage);
    }
  }
);

const poolsByLocationSlice = createSlice({
  name: "poolsByLocation",
  initialState: {
    response: [], // Changed from null to empty array
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    // Reset pools state
    resetPoolsByLocationState: (state) => {
      state.response = [];
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
    // Clear error
    clearPoolsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(poolsAvailable.pending, (state) => {
        console.log('🏊 Redux - poolsAvailable.pending');
        state.loading = true;
        state.error = null;
        state.serverResponded = false;
      })
      .addCase(poolsAvailable.fulfilled, (state, action) => {
        console.log('🏊 Redux - poolsAvailable.fulfilled with payload:', action.payload);
        state.loading = false;
        state.response = action.payload || []; // Ensure it's always an array
        state.error = null;
        state.serverResponded = true;
      })
      .addCase(poolsAvailable.rejected, (state, action) => {
        console.log('🏊 Redux - poolsAvailable.rejected with error:', action.payload);
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pools';
        state.response = []; // Set to empty array on error
        state.serverResponded = true;
      });
  },
});

export const { resetPoolsByLocationState, clearPoolsError } = poolsByLocationSlice.actions;
export default poolsByLocationSlice.reducer;