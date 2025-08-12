import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const SERVER_URL = "https://fastapi-pool-mgt.onrender.com";

export const forecast = createAsyncThunk(
  "prediction/forecast",
  async (data) => {
    try {
      const response = await axios({
        method: "get",
        url: `${SERVER_URL}/parameters/predict/${data.day}/${data.hour}`,
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
      throw err;
    }
  }
);

const forecastSlice = createSlice({
  name: "forecast",
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
    builder.addCase(forecast.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(forecast.fulfilled, (state, action) => {
      state.loading = false;
      state.response = { ...action.payload };
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(forecast.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = false;
    });
  },
});

export const forecastActions = forecastSlice.actions;
export default forecastSlice;
