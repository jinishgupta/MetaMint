import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  nfts: [],
  nft: null,
  uploadResult: null,
  imageResult: null,
  loading: false,
  error: null,
};

// Upload image file to IPFS
export const uploadImage = createAsyncThunk(
  "ipfs/uploadImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post("http://localhost:4000/api/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Upload metadata JSON to IPFS
export const uploadData = createAsyncThunk(
  "ipfs/uploadData",
  async (metadata, { rejectWithValue }) => {
    try {
      const response = await axios.post("http://localhost:4000/api/upload-data", metadata, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch Data by CID
export const fetchDataByCid = createAsyncThunk(
  "ipfs/fetchDataByCid",
  async (cid, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/data/${cid}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch NFTs by group
export const fetchDataByGroup = createAsyncThunk(
  "ipfs/fetchDataByGroup",
  async (group, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/data-group?group=${encodeURIComponent(group)}`);
      return response.data.nfts;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const ipfsSlice = createSlice({
  name: "ipfs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Upload image
      .addCase(uploadImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.loading = false;
        state.imageResult = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Upload NFT metadata
      .addCase(uploadData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadData.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadResult = action.payload;
      })
      .addCase(uploadData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch NFT by CID
      .addCase(fetchDataByCid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataByCid.fulfilled, (state, action) => {
        state.loading = false;
        state.nft = action.payload;
      })
      .addCase(fetchDataByCid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch NFTs by group
      .addCase(fetchDataByGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataByGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.nfts = action.payload;
      })
      .addCase(fetchDataByGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default ipfsSlice.reducer;