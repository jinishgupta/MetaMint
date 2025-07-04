import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  nfts: [],
  currentNFT: null,
  isLoading: false,
  error: null,
  saveLoading: false,
  saveError: null,
  saveSuccess: false,
  fetchLoading: false,
  fetchError: null,
};

// Async thunks for NFT operations
export const fetchAllNFTs = createAsyncThunk(
  'nft/fetchAllNFTs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:5000/api/nfts', {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch NFTs');
    }
  }
);

export const fetchNFTById = createAsyncThunk(
  'nft/fetchNFTById',
  async (tokenId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/nft/${tokenId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch NFT');
    }
  }
);

export const saveNFT = createAsyncThunk(
  'nft/saveNFT',
  async ({ tokenId, owner, name, description, image, metadataUrl, price, isListed, auctionId }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/nft', 
        { tokenId, owner, name, description, image, metadataUrl, price, isListed, auctionId },
        {
            withCredentials: true,
        });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save NFT');
    }
  }
);


const nftSlice = createSlice({
  name: 'nft',
  initialState,
  reducers: {
    clearNFTError: (state) => {
      state.error = null;
      state.saveError = null;
      state.fetchError = null;
    },
    clearNFTSuccess: (state) => {
      state.saveSuccess = false;
    },
    setCurrentNFT: (state, action) => {
      state.currentNFT = action.payload;
    },
    clearCurrentNFT: (state) => {
      state.currentNFT = null;
    },
    updateNFTInList: (state, action) => {
      const { tokenId, updates } = action.payload;
      const index = state.nfts.findIndex(nft => nft.tokenId === tokenId);
      if (index !== -1) {
        state.nfts[index] = { ...state.nfts[index], ...updates };
      }
    },
    addNFTToList: (state, action) => {
      state.nfts.unshift(action.payload);
    },
    removeNFTFromList: (state, action) => {
      const tokenId = action.payload;
      state.nfts = state.nfts.filter(nft => nft.tokenId !== tokenId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all NFTs
      .addCase(fetchAllNFTs.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchAllNFTs.fulfilled, (state, action) => {
        state.fetchLoading = false;
        if (action.payload.success) {
          state.nfts = action.payload.nfts;
        } else {
          state.fetchError = action.payload.message;
        }
      })
      .addCase(fetchAllNFTs.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
      })
      
      // Fetch NFT by ID
      .addCase(fetchNFTById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNFTById.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.currentNFT = action.payload.nft;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(fetchNFTById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Save NFT
      .addCase(saveNFT.pending, (state) => {
        state.saveLoading = true;
        state.saveError = null;
        state.saveSuccess = false;
      })
      .addCase(saveNFT.fulfilled, (state, action) => {
        state.saveLoading = false;
        if (action.payload.success) {
          state.saveSuccess = true;
          // Update or add NFT to the list
          const index = state.nfts.findIndex(nft => nft.tokenId === action.payload.nft.tokenId);
          if (index !== -1) {
            state.nfts[index] = action.payload.nft;
          } else {
            state.nfts.unshift(action.payload.nft);
          }
        } else {
          state.saveError = action.payload.message;
        }
      })
      .addCase(saveNFT.rejected, (state, action) => {
        state.saveLoading = false;
        state.saveError = action.payload;
      })
  },
});

export const {
  clearNFTError,
  clearNFTSuccess,
  setCurrentNFT,
  clearCurrentNFT,
  updateNFTInList,
  addNFTToList,
  removeNFTFromList,
} = nftSlice.actions;

export default nftSlice.reducer;