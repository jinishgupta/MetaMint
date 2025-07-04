import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  auctions: [],
  currentAuction: null,
  isLoading: false,
  error: null,
  saveLoading: false,
  saveError: null,
  saveSuccess: false,
  fetchLoading: false,
  fetchError: null,
  bidLoading: false,
  bidError: null,
  bidSuccess: false,
  settleLoading: false,
  settleError: null,
  settleSuccess: false,
};

// Async thunks for auction operations
export const fetchAllAuctions = createAsyncThunk(
  'auction/fetchAllAuctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/auctions', {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auctions');
    }
  }
);

export const fetchAuctionById = createAsyncThunk(
  'auction/fetchAuctionById',
  async (auctionId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auction/${auctionId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auction');
    }
  }
);

export const saveAuction = createAsyncThunk(
  'auction/saveAuction',
  async ({ auctionId, tokenId, seller, minBid, highestBid, highestBidder, endTime, settled }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auction', 
        { auctionId, tokenId, seller, minBid, highestBid, highestBidder, endTime, settled },
      {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save auction');
    }
  }
);

const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    clearAuctionError: (state) => {
      state.error = null;
      state.saveError = null;
      state.fetchError = null;
      state.bidError = null;
      state.settleError = null;
    },
    clearAuctionSuccess: (state) => {
      state.saveSuccess = false;
      state.bidSuccess = false;
      state.settleSuccess = false;
    },
    setCurrentAuction: (state, action) => {
      state.currentAuction = action.payload;
    },
    clearCurrentAuction: (state) => {
      state.currentAuction = null;
    },
    updateAuctionInList: (state, action) => {
      const { auctionId, updates } = action.payload;
      const index = state.auctions.findIndex(auction => auction.auctionId === auctionId);
      if (index !== -1) {
        state.auctions[index] = { ...state.auctions[index], ...updates };
      }
    },
    addAuctionToList: (state, action) => {
      state.auctions.unshift(action.payload);
    },
    removeAuctionFromList: (state, action) => {
      const auctionId = action.payload;
      state.auctions = state.auctions.filter(auction => auction.auctionId !== auctionId);
    },
    updateBidInAuction: (state, action) => {
      const { auctionId, bidAmount, bidder } = action.payload;
      const auction = state.auctions.find(a => a.auctionId === auctionId);
      if (auction) {
        auction.highestBid = bidAmount;
        auction.highestBidder = bidder;
      }
      if (state.currentAuction && state.currentAuction.auctionId === auctionId) {
        state.currentAuction.highestBid = bidAmount;
        state.currentAuction.highestBidder = bidder;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all auctions
      .addCase(fetchAllAuctions.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchAllAuctions.fulfilled, (state, action) => {
        state.fetchLoading = false;
        if (action.payload.success) {
          state.auctions = action.payload.auctions;
        } else {
          state.fetchError = action.payload.message;
        }
      })
      .addCase(fetchAllAuctions.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
      })
      
      // Fetch auction by ID
      .addCase(fetchAuctionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuctionById.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.currentAuction = action.payload.auction;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(fetchAuctionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Save auction
      .addCase(saveAuction.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
        state.saveSuccess = false;
      })
      .addCase(saveAuction.fulfilled, (state, action) => {
        state.saveLoading = false;
        if (action.payload.success) {
          state.saveSuccess = true;
          // Update or add auction to the list
          const index = state.auctions.findIndex(auction => auction.auctionId === action.payload.auction.auctionId);
          if (index !== -1) {
            state.auctions[index] = action.payload.auction;
          } else {
            state.auctions.unshift(action.payload.auction);
          }
        } else {
          state.saveError = action.payload.message;
        }
      })
      .addCase(saveAuction.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      })
  },
});

export const {
  clearAuctionError,
  clearAuctionSuccess,
  setCurrentAuction,
  clearCurrentAuction,
  updateAuctionInList,
  addAuctionToList,
  removeAuctionFromList,
  updateBidInAuction,
} = auctionSlice.actions;

export default auctionSlice.reducer;