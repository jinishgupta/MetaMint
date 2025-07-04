import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  auctionId: { type: String, required: true, unique: true },
  tokenId: { type: String, required: true },
  seller: { type: String, required: true },
  minBid: { type: String, required: true },
  highestBid: { type: String, default: '0' },
  highestBidder: { type: String, default: null },
  endTime: { type: Date, required: true },
  settled: { type: Boolean, default: false },
}, { timestamps: true });

const Auction = mongoose.model('Auction', auctionSchema);
export default Auction;  