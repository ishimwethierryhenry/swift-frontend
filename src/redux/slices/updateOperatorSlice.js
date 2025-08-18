import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const updateOperator = createAsyncThunk(
  'operators/update',
  async (operatorData, { rejectWithValue }) => {
    try {
      const tokenStr = localStorage.getItem('token');
      
      // Transform data to match backend expectations
      const requestData = {
        newRole: operatorData.role, // Backend expects "newRole"
        fname: operatorData.fname,   // ✅ Add all fields
        lname: operatorData.lname,
        email: operatorData.email,
        phone: operatorData.phone,
        location: operatorData.location,
      };
      
      const response = await axios({
        method: "put",
        url: `${SERVER_URL}/users/update/${operatorData.id}`,
        data: requestData, // Send only newRole
        headers: { 
          Authorization: `Bearer ${tokenStr}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success("Operator updated successfully!", {
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
      toast.error("Error: Failed to update operator", {
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
        error.response?.data?.message || 'Failed to update operator'
      );
    }
  }
);

const updateOperatorSlice = createSlice({
  name: 'updateOperator',
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    resetUpdateOperatorState: (state) => {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateOperator.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.serverResponded = false;
      })
      .addCase(updateOperator.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
        state.serverResponded = true;
      })
      .addCase(updateOperator.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.serverResponded = true;
      });
  },
});

export const { resetUpdateOperatorState } = updateOperatorSlice.actions;
export default updateOperatorSlice.reducer;