import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import nftReducer from "./nftSlice";
import auctionReducer from "./auctionSlice";

const store = configureStore({
  reducer: {
    auth:authReducer,
    nft:nftReducer,
    auction:auctionReducer,
  },
});

export default store;