import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const registerPool = createAsyncThunk("pools/add", async (data) => {
  try {
    const tokenStr = localStorage.getItem("token");

    const response = await axios({
      method: "post",
      url: `${SERVER_URL}/pools/create`,
      data,
      headers: { Authorization: `Bearer ${tokenStr}` },
    });

    if (response.status == 201) {
      toast.success("Pool registered successfully!", {
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
    toast.error("Pool not registered", {
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

const poolAddSlice = createSlice({
  name: "pools",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  extraReducers: (builder) => {
    builder.addCase(registerPool.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(registerPool.fulfilled, (state, action) => {
      state.loading = false;
      state.response = { ...action.payload };
      state.error = null;
      state.serverResponded = true;
    });
    builder.addCase(registerPool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
      state.serverResponded = true;
    });
  },
});

export default poolAddSlice.reducer;
