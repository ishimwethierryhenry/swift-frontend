import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const updatePool = createAsyncThunk(
  "pools/update",
  async (submitData) => {
    try {
      const tokenStr = localStorage.getItem("token");

      const response = await axios({
        method: "put",
        url: `${SERVER_URL}/pools/update/${submitData.poolId}`,
        data: submitData.formData,
        headers: { Authorization: `Bearer ${tokenStr}` },
      });

      console.log(response);

      if (response.status == 200) {
        toast.success("Pool updated", {
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
      toast.error("Pool not updated", {
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
  }
);

const poolUpdateSlice = createSlice({
  name: "poolsUpdate",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  extraReducers: (builder) => {
    builder.addCase(updatePool.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updatePool.fulfilled, (state, action) => {
      state.loading = false;
      state.response = { ...action.payload };
      state.error = null;
      state.serverResponded = true;
    });
    builder.addCase(updatePool.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error;
      state.serverResponded = true;
    });
  },
});

export default poolUpdateSlice.reducer;
