// 6. NEW FILE: src/redux/slices/guestsByLocationSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const guestsAvailable = createAsyncThunk(
  "guests/location",
  async (location) => {
    try {
      const tokenStr = localStorage.getItem("token");
      let str = location.trim();
      const locParam = str.replace(" ", "&");

      const response = await axios({
        method: "get",
        url: `${SERVER_URL}/users/guests/${locParam}`,
        headers: { Authorization: `Bearer ${tokenStr}` },
      });
      let guests = [];

      if (response.status == 200) {
        guests = [...guests, ...response.data.allUsers];
        return guests;
      }
    } catch (error) {
      console.log(error);
      toast.error("Error: Something went wrong while fetching guests", {
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

const guestsByLocationSlice = createSlice({
  name: "guestsByLocation",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  extraReducers: (builder) => {
    builder.addCase(guestsAvailable.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(guestsAvailable.fulfilled, (state, action) => {
      state.loading = false;
      state.response = action.payload;
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(guestsAvailable.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = false;
    });
  },
});

export default guestsByLocationSlice;
