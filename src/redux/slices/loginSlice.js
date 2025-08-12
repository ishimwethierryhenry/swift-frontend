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
  async (submiData, { dispatch }) => {
    try {
      const response = await axios({
        method: "post",
        url: `${SERVER_URL}/users/login`,
        data: { email: submiData.email, pwd: submiData.password },
      });

      if (response.status == 200) {
        const { token } = response.data;

        if (token) {
          localStorage.setItem("token", token);

          const data = tokenDec(token);

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
      throw err;
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
  },
  extraReducers: (builder) => {
    builder.addCase(auth.pending, (state) => {
      state.loading = true;
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
      state.serverResponded = false;
    });
  },
});
export const loginActions = loginSlice.actions;
export default loginSlice;
