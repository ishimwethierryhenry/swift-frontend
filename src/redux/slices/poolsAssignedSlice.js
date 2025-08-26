import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const poolsAssigned = createAsyncThunk("pools/assigned", async (id) => {
  try {
    console.log(`🔍 Fetching pools for operator ID: ${id}`);
    console.log(`🌐 API URL: ${SERVER_URL}/pools/operator/${id}`);
    
    const tokenStr = localStorage.getItem("token");
    
    if (!tokenStr) {
      throw new Error("No authentication token found");
    }

    const response = await axios({
      method: "get",
      url: `${SERVER_URL}/pools/operator/${id}`,
      headers: { 
        Authorization: `Bearer ${tokenStr}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log(`✅ API Response Status: ${response.status}`);
    console.log(`📊 API Response Data:`, response.data);

    if (response.status === 200) {
      // Validate response structure
      if (response.data && response.data.allPools) {
        const pools = Array.isArray(response.data.allPools) ? response.data.allPools : [];
        console.log(`🏊 Found ${pools.length} assigned pools`);
        return pools;
      } else {
        console.warn("⚠️ API response missing allPools array");
        return [];
      }
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error fetching assigned pools:", error);
    
    // More specific error messages
    if (error.response) {
      // Server responded with error status
      const errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      console.error(`🚨 Server Error (${error.response.status}):`, error.response.data);
      
      toast.error(`Error: ${errorMsg}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else if (error.request) {
      // Network error
      console.error("🌐 Network Error:", error.request);
      toast.error("Error: Unable to connect to server", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } else {
      // Other error
      console.error("⚡ General Error:", error.message);
      toast.error(`Error: ${error.message}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    
    // Return empty array instead of throwing - this prevents the component crash
    return [];
  }
});

const poolsAssignedSlice = createSlice({
  name: "assignedPools",
  initialState: {
    response: [],  // Initialize as empty array instead of null
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    resetAssignedPoolsState: (state) => {
      state.response = [];  // Reset to empty array
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(poolsAssigned.pending, (state) => {
      console.log("⏳ Loading assigned pools...");
      state.loading = true;
      state.error = null;
      state.serverResponded = false;
    });
    builder.addCase(poolsAssigned.fulfilled, (state, action) => {
      console.log("✅ Successfully loaded assigned pools:", action.payload);
      state.loading = false;
      state.response = Array.isArray(action.payload) ? action.payload : [];
      state.error = null;
      state.serverResponded = true;
    });
    builder.addCase(poolsAssigned.rejected, (state, action) => {
      console.error("❌ Failed to load assigned pools:", action.error);
      state.loading = false;
      state.response = []; // Set to empty array on error
      state.error = action.error;
      state.serverResponded = true;
    });
  },
});

export const { resetAssignedPoolsState } = poolsAssignedSlice.actions;
export default poolsAssignedSlice.reducer;