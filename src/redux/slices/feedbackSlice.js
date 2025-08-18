// =================== FEEDBACK REDUX SLICE ===================
// src/redux/slices/feedbackSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks for feedback operations
export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/feedback/submit`,
        feedbackData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit feedback'
      );
    }
  }
);

export const fetchMyFeedback = createAsyncThunk(
  'feedback/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/feedback/my-feedback`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch feedback'
      );
    }
  }
);

export const fetchAllFeedback = createAsyncThunk(
  'feedback/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/feedback/all?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch feedback'
      );
    }
  }
);

export const fetchFeedbackStats = createAsyncThunk(
  'feedback/fetchStats',
  async (timeRange = 'month', { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/feedback/statistics?timeRange=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.statistics;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch feedback statistics'
      );
    }
  }
);

export const respondToFeedback = createAsyncThunk(
  'feedback/respond',
  async ({ feedbackId, adminResponse, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/feedback/respond/${feedbackId}`,
        { adminResponse, status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to respond to feedback'
      );
    }
  }
);

export const updateFeedbackStatus = createAsyncThunk(
  'feedback/updateStatus',
  async ({ feedbackId, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/feedback/status/${feedbackId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update feedback status'
      );
    }
  }
);

const initialState = {
  // Guest feedback state
  myFeedback: [],
  myFeedbackLoading: false,
  myFeedbackError: null,
  
  // Admin feedback state
  allFeedback: [],
  allFeedbackLoading: false,
  allFeedbackError: null,
  feedbackPagination: {
    total: 0,
    limit: 50,
    offset: 0,
    pages: 0
  },
  
  // Statistics
  feedbackStats: null,
  statsLoading: false,
  statsError: null,
  
  // UI state
  submitLoading: false,
  submitError: null,
  responseLoading: false,
  responseError: null,
  
  // Filters
  filters: {
    status: 'all',
    feedbackType: 'all',
    priority: 'all',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  }
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.myFeedbackError = null;
      state.allFeedbackError = null;
      state.submitError = null;
      state.responseError = null;
      state.statsError = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFeedback: (state) => {
      state.myFeedback = [];
      state.allFeedback = [];
      state.feedbackStats = null;
    },
    updateFeedbackInList: (state, action) => {
      const updatedFeedback = action.payload;
      
      // Update in allFeedback array
      const allIndex = state.allFeedback.findIndex(f => f.id === updatedFeedback.id);
      if (allIndex !== -1) {
        state.allFeedback[allIndex] = updatedFeedback;
      }
      
      // Update in myFeedback array
      const myIndex = state.myFeedback.findIndex(f => f.id === updatedFeedback.id);
      if (myIndex !== -1) {
        state.myFeedback[myIndex] = updatedFeedback;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit Feedback
      .addCase(submitFeedback.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.submitLoading = false;
        // Add to myFeedback if it's the current user's feedback
        state.myFeedback.unshift(action.payload.data);
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
      
      // Fetch My Feedback
      .addCase(fetchMyFeedback.pending, (state) => {
        state.myFeedbackLoading = true;
        state.myFeedbackError = null;
      })
      .addCase(fetchMyFeedback.fulfilled, (state, action) => {
        state.myFeedbackLoading = false;
        state.myFeedback = action.payload;
      })
      .addCase(fetchMyFeedback.rejected, (state, action) => {
        state.myFeedbackLoading = false;
        state.myFeedbackError = action.payload;
      })
      
      // Fetch All Feedback (Admin)
      .addCase(fetchAllFeedback.pending, (state) => {
        state.allFeedbackLoading = true;
        state.allFeedbackError = null;
      })
      .addCase(fetchAllFeedback.fulfilled, (state, action) => {
        state.allFeedbackLoading = false;
        state.allFeedback = action.payload.data;
        state.feedbackPagination = action.payload.pagination;
      })
      .addCase(fetchAllFeedback.rejected, (state, action) => {
        state.allFeedbackLoading = false;
        state.allFeedbackError = action.payload;
      })
      
      // Fetch Feedback Statistics
      .addCase(fetchFeedbackStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchFeedbackStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.feedbackStats = action.payload;
      })
      .addCase(fetchFeedbackStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Respond to Feedback
      .addCase(respondToFeedback.pending, (state) => {
        state.responseLoading = true;
        state.responseError = null;
      })
      .addCase(respondToFeedback.fulfilled, (state, action) => {
        state.responseLoading = false;
        // Update the feedback in the list
        const updatedFeedback = action.payload;
        const index = state.allFeedback.findIndex(f => f.id === updatedFeedback.id);
        if (index !== -1) {
          state.allFeedback[index] = updatedFeedback;
        }
      })
      .addCase(respondToFeedback.rejected, (state, action) => {
        state.responseLoading = false;
        state.responseError = action.payload;
      })
      
      // Update Feedback Status
      .addCase(updateFeedbackStatus.pending, (state) => {
        state.responseLoading = true;
        state.responseError = null;
      })
      .addCase(updateFeedbackStatus.fulfilled, (state, action) => {
        state.responseLoading = false;
        // Update the feedback in the list
        const updatedFeedback = action.payload;
        const index = state.allFeedback.findIndex(f => f.id === updatedFeedback.id);
        if (index !== -1) {
          state.allFeedback[index] = updatedFeedback;
        }
      })
      .addCase(updateFeedbackStatus.rejected, (state, action) => {
        state.responseLoading = false;
        state.responseError = action.payload;
      });
  }
});

export const { 
  clearErrors, 
  setFilters, 
  clearFeedback, 
  updateFeedbackInList 
} = feedbackSlice.actions;

export default feedbackSlice.reducer;