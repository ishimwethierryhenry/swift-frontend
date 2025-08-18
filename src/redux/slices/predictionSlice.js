import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const SERVER_URL = "https://fastapi-pool-mgt.onrender.com";

const now = new Date();

const currentDay = now.getDay(); // Sunday - Saturday : 0 - 6
const currentHour = now.getHours(); // 0 - 23

export const predictionNow = createAsyncThunk("prediction/now", async () => {
  try {
    const response = await axios({
      method: "get",
      url: `${SERVER_URL}/maintainance/predict/${currentDay}/${currentHour}`,
    });
    if (response.status == 200) {
      toast.success("New prediction executed", {
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
    toast.error("Error: Prediction not executed", {
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

const predictionSlice = createSlice({
  name: "availability",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    resetData(state, action) {
      state.response = null;
      state.serverResponded = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(predictionNow.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(predictionNow.fulfilled, (state, action) => {
      state.loading = false;
      state.response = { ...action.payload };
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(predictionNow.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = false;
    });
  },
});

export const predictionActions = predictionSlice.actions;
export default predictionSlice.reducer;
