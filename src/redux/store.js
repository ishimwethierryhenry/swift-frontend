import { configureStore } from "@reduxjs/toolkit";
import predictionSlice from "./slices/predictionSlice";
import activeLinksSlice from "./slices/activeLinkSlice";
import userSlice from "./slices/userSlice";
import loginSlice from "./slices/loginSlice";
import poolsAssignedSlice from "./slices/poolsAssignedSlice";
import poolsByLocationSlice from "./slices/poolsByLocationSlice";
import operatorsByLocationSlice from "./slices/operatorsByLocationSlice";
import poolAddSlice from "./slices/poolAddSlice";
import operatorAddSlice from "./slices/operatorAddSlice";
import locationsSlice from "./slices/locationsSlice";
import poolUpdateSlice from "./slices/poolUpdateSlice";
import forecastSlice from "./slices/forecastSlice";
import deletePoolSlice from "./slices/deletePoolSlice";
import deleteOperatorSlice from "./slices/deleteOperatorSlice"; // Add this import

const store = configureStore({
  reducer: {
    prediction: predictionSlice.reducer,
    activeLinks: activeLinksSlice.reducer,
    user: userSlice.reducer,
    login: loginSlice.reducer,
    assignedPools: poolsAssignedSlice.reducer,
    poolsByLocation: poolsByLocationSlice.reducer,
    operatorsByLocation: operatorsByLocationSlice.reducer,
    pools: poolAddSlice.reducer,
    operators: operatorAddSlice.reducer,
    locations: locationsSlice.reducer,
    poolUpdate: poolUpdateSlice.reducer,
    forecast: forecastSlice.reducer,
    deletePool: deletePoolSlice.reducer,
    deleteOperator: deleteOperatorSlice.reducer, // Add this line
  },
});

export default store;