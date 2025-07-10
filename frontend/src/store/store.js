import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import ipfsReducer from "./ipfsSlice";

const store = configureStore({
  reducer: {
    auth:authReducer,
    ipfs: ipfsReducer
  },
});

export default store;