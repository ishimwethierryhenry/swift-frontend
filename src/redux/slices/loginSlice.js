import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import tokenDec from "../../helpers/tokenDec";
import { userActions } from "./userSlice";
import { capitalizeFirstLetter } from "../../helpers/capitalCase";
import { variables } from "../../data/constants";

const SERVER_URL = variables.SERVER_URL;

export const auth = createAsyncThunk(
  "users/login",
  async (submitData, { dispatch }) => {
    try {
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/users/login`,
        data: { email: submitData.email, pwd: submitData.pwd },
      });

      console.log('🔍 Frontend received response:', response.data);

      if (response.status == 200) {
        const { token } = response.data;

        console.log('🔍 Token received:', token);

        if (token) {
          localStorage.setItem("token", token);

          const data = tokenDec(token);

          console.log('🔍 Decoded token data:', data);

          if (data) {
            dispatch(userActions.setUserData(data.user));

            let str = `${capitalizeFirstLetter(
              data.user.fname
            )} ${capitalizeFirstLetter(data.user.lname)}`;
            localStorage.setItem("user_id", data.user.id);
            localStorage.setItem("user_role", data.user.role);
            localStorage.setItem("user_location", data.user.location);
            localStorage.setItem("user_name", str);

            return response.data;
          }
        }
        return null;
      }
    } catch (error) {
      console.log(error);
      toast.error(`Signin failed: ${error.message}`);
      throw error; // Fix: was "throw err" - should be "throw error"
    }
  }
);

const loginSlice = createSlice({
  name: "login",
  initialState: {
    response: null,
    loading: false,
    error: null,
    serverResponded: false,
  },
  reducers: {
    setRole(state, action) {
      state.role = action.payload;
    },
    clearLoginState(state) { // Add this reducer
      state.response = null;
      state.loading = false;
      state.error = null;
      state.serverResponded = false;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(auth.pending, (state) => {
      state.loading = true;
      state.serverResponded = false; // Reset on new request
    });
    builder.addCase(auth.fulfilled, (state, action) => {
      state.loading = false;
      state.response = { ...action.payload };
      state.error = null;
      state.serverResponded = action.payload ? true : false;
    });
    builder.addCase(auth.rejected, (state, action) => {
      state.loading = false;
      state.error = { ...action.error };
      state.serverResponded = true; // Should be true even on error
    });
  },
});

export const loginActions = loginSlice.actions;
export default loginSlice.reducer; // ⚠️ CRITICAL FIX: Export the reducer, not the slice!