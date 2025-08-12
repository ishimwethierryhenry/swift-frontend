import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const poolsAssigned = createAsyncThunk("pools/assigned", async (id) => {
  try {
    const tokenStr = localStorage.getItem("token");

    const response = await axios({
      method: "get",
      url: `${SERVER_URL}/pools/operator/${id}`,
      headers: { Authorization: `Bearer ${tokenStr}` },
    });
    let pools = [];

    if (response.status == 200) {
      pools = [...pools, ...response.data.allPools];
      return pools;
    }
  } catch (error) {
    console.log(error);
    toast.error("Error: Something went wrong", {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    throw err;
  }
});

const poolsAssignedSlice = createSlice({
  name: "assignedPools",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  extraReducers: (builder) => {
    builder.addCase(poolsAssigned.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(poolsAssigned.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(poolsAssigned.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = false;
    });
  },
});

export default poolsAssignedSlice;
