import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  owner: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  metadataUrl: { type: String },
  price: { type: String }, // Store as string to avoid JS float issues
  isListed: { type: Boolean, default: false },
  auctionId: { type: String, default: null },
}, { timestamps: true });

const NFT = mongoose.model('NFT', nftSchema);
export default NFT;