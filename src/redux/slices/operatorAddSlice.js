import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const registerOperator = createAsyncThunk("users/add", async (data) => {
  try {
    const tokenStr = localStorage.getItem("token");

    const response = await axios({
      method: "post",
      url: `${SERVER_URL}/users/signup`,
      data,
      headers: { Authorization: `Bearer ${tokenStr}` },
    });

    if (response.status == 201) {
      toast.success("Pool Operator registered Successfully!", {
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
    toast.error("Operator not registered", {
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

const operatorAddSlice = createSlice({
  name: "operators",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  extraReducers: (builder) => {
    builder.addCase(registerOperator.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(registerOperator.fulfilled, (state, action) => {
      state.loading = false;
      state.response = { ...action.payload };
      state.error = null;
      state.serverResponded = true;
    });
    builder.addCase(registerOperator.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
      state.serverResponded = true;
    });
  },
});

export default operatorAddSlice.reducer;
