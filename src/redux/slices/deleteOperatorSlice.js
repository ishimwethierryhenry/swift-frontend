// redux/slices/deleteOperatorSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const deleteOperator = createAsyncThunk("operators/delete", async (operatorId) => {
  try {
    const tokenStr = localStorage.getItem("token");

    const response = await axios({
      method: "delete",
      url: `${SERVER_URL}/users/delete/${operatorId}`,
      headers: { Authorization: `Bearer ${tokenStr}` },
    });

    if (response.status === 200) {
      toast.success("Operator deleted successfully!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return { operatorId, message: response.data.message };
    }
  } catch (error) {
    console.log(error);
    toast.error("Error: Failed to delete operator", {
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

const deleteOperatorSlice = createSlice({
  name: "deleteOperator",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    resetDeleteOperatorState: (state) => {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteOperator.pending, (state) => {
      state.loading = true;
      state.serverResponded = false;
    });
    builder.addCase(deleteOperator.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(deleteOperator.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = false;
    });
  },
});

export const { resetDeleteOperatorState } = deleteOperatorSlice.actions;
export default deleteOperatorSlice;