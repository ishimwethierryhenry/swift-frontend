import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const poolsAvailable = createAsyncThunk(
  "pools/location",
  async (location) => {
    try {
      const tokenStr = localStorage.getItem("token");
      let str = location.trim();
      const locParam = str.replace(" ", "&");

      const response = await axios({
        method: "get",
        url: `${SERVER_URL}/pools/${locParam}`,
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
      throw error; // ⚠️ Fixed: was "throw err"
    }
  }
);

const poolsByLocationSlice = createSlice({
  name: "poolsByLocation",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    // ADD THIS:
    resetPoolsByLocationState: (state) => {
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(poolsAvailable.pending, (state) => {
      state.loading = true;
      state.serverResponded = false; // Reset on new request
    });
    builder.addCase(poolsAvailable.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(poolsAvailable.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = true; // ⚠️ Fixed: changed from false to true
    });
  },
});

export default poolsByLocationSlice.reducer;