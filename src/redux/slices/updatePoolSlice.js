// src/redux/slices/updatePoolSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const updatePool = createAsyncThunk(
  'pools/update',
  async (poolData, { rejectWithValue }) => {
    try {
      const tokenStr = localStorage.getItem('token');
      
      const response = await axios({
        method: "put",
        url: `${SERVER_URL}/pools/update/${poolData.poolId}`,
        data: poolData.formData,
        headers: { 
          Authorization: `Bearer ${tokenStr}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("Pool updated successfully!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        return response.data;
      }
    } catch (error) {
      console.log(error);
      toast.error("Error: Failed to update pool", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update pool'
      );
    }
  }
);

const updatePoolSlice = createSlice({
  name: 'updatePool',
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    resetUpdatePoolState: (state) => {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePool.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.serverResponded = false;
      })
      .addCase(updatePool.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
        state.serverResponded = true;
      })
      .addCase(updatePool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.serverResponded = true;
      });
  },
});

export const { resetUpdatePoolState } = updatePoolSlice.actions;
export default updatePoolSlice.reducer;