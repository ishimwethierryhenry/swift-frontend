// src/redux/store.js - UPDATED VERSION
import { configureStore } from "@reduxjs/toolkit";
import loginSlice from "./slices/loginSlice";
import userSlice from "./slices/userSlice";
import activeLinkSlice from "./slices/activeLinkSlice";
import locationsSlice from "./slices/locationsSlice";
import poolsAssignedSlice from "./slices/poolsAssignedSlice";
import poolsByLocationSlice from "./slices/poolsByLocationSlice";
import operatorsByLocationSlice from "./slices/operatorsByLocationSlice";
import guestsByLocationSlice from "./slices/guestsByLocationSlice";
import poolAddSlice from "./slices/poolAddSlice";
import operatorAddSlice from "./slices/operatorAddSlice";
import poolUpdateSlice from "./slices/poolUpdateSlice";
import updatePoolSlice from "./slices/updatePoolSlice"; // ✅ ADD THIS LINE
import deletePoolSlice from "./slices/deletePoolSlice";
import deleteOperatorSlice from "./slices/deleteOperatorSlice";
import updateOperatorSlice from "./slices/updateOperatorSlice";
import predictionSlice from "./slices/predictionSlice";
import forecastSlice from "./slices/forecastSlice";

const store = configureStore({
  reducer: {
    login: loginSlice,
    user: userSlice,
    activeLinks: activeLinkSlice,
    locations: locationsSlice,
    assignedPools: poolsAssignedSlice,
    poolsByLocation: poolsByLocationSlice,
    operatorsByLocation: operatorsByLocationSlice,
    guestsByLocation: guestsByLocationSlice,
    poolAdd: poolAddSlice,
    operatorAdd: operatorAddSlice,
    poolUpdate: poolUpdateSlice,
    updatePool: updatePoolSlice, // ✅ ADD THIS LINE
    deletePool: deletePoolSlice,
    deleteOperator: deleteOperatorSlice,
    updateOperator: updateOperatorSlice,
    prediction: predictionSlice,
    forecast: forecastSlice,
  },
});

export default store;