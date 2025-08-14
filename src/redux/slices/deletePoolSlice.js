// redux/slices/deletePoolSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const deletePool = createAsyncThunk("pools/delete", async (poolId) => {
  try {
    const tokenStr = localStorage.getItem("token");

    const response = await axios({
      method: "delete",
      url: `${SERVER_URL}/pools/delete/${poolId}`,
      headers: { Authorization: `Bearer ${tokenStr}` },
    });

    if (response.status === 200) {
      toast.success("Pool deleted successfully!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return { poolId, message: response.data.message };
    }
  } catch (error) {
    console.log(error);
    toast.error("Error: Failed to delete pool as you are unauthorized, Kindly reach out to the admin if you think this is a mistake", {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    throw error;
  }
});

const deletePoolSlice = createSlice({
  name: "deletePool",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    resetDeletePoolState: (state) => {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deletePool.pending, (state) => {
      state.loading = true;
      state.serverResponded = false;
    });
    builder.addCase(deletePool.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(deletePool.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = false;
    });
  },
});

export const { resetDeletePoolState } = deletePoolSlice.actions;
export default deletePoolSlice;