import { createSlice } from "@reduxjs/toolkit";

const activeLinksSlice = createSlice({
  name: "activeLinks",
  initialState: {
    active: "Overview",
  },
  reducers: {
    setActiveLink(state, action) {
      state.active = action.payload;
    },
  },
});

export const activeLinksActions = activeLinksSlice.actions;
export default activeLinksSlice.reducer; // ⚠️ ADD .reducer here!