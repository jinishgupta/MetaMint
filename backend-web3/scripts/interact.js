import { ethers } from "ethers";
// Replace with your deployed contract addresses
const NFT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const AUCTION_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

// Helper to get the listing price from the contract
async function getListPrice() {
  const NFT = await ethers.getContractAt("NFTMarketplace", NFT_ADDRESS);
  const listPrice = await NFT.getListPrice();
  return listPrice;
}

async function mintNFT(tokenURI, price) {
  const NFT = await ethers.getContractAt("NFTMarketplace", NFT_ADDRESS);
  const listPrice = await getListPrice();
  const tx = await NFT.mintNFT(tokenURI, price, { value: listPrice });
  const receipt = await tx.wait();
  // The event is TokenListedSuccess
  const event = receipt.events.find(e => e.event === "TokenListedSuccess");
  if (!event) {
    throw new Error("TokenListedSuccess event not found");
  }
  return {
    tokenId: event.args.tokenId.toString(),
    owner: event.args.owner,
    price: event.args.price.toString(),
  };
}

async function buyNFT(tokenId, price) {
  const NFT = await ethers.getContractAt("NFTMarketplace", NFT_ADDRESS);
  const tx = await NFT.buyNFT(tokenId, { value: price });
  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === "TokenBoughtSuccess");
  if (!event) {
    throw new Error("TokenBoughtSuccess event not found");
  }
  return {
    tokenId: event.args.tokenId.toString(),
    buyer: event.args.owner,
    price: event.args.price.toString(),
  };
}

async function createAuction(tokenId, minBid, duration) {
  const Auction = await ethers.getContractAt("Auction", AUCTION_ADDRESS);
  const NFT = await ethers.getContractAt("NFTMarketplace", NFT_ADDRESS); 
  // Approve auction contract to transfer NFT
  await NFT.approve(AUCTION_ADDRESS, tokenId);
  const tx = await Auction.createAuction(NFT_ADDRESS, tokenId, minBid, duration);
  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === "AuctionCreated");
  if (!event) {
    throw new Error("AuctionCreated event not found");
  }
  return {
    auctionId: event.args.auctionId.toString(),
    tokenId: event.args.tokenId.toString(),
    seller: event.args.seller,
    minBid: event.args.minBid.toString(),
    endTime: event.args.endTime.toString(),
  }
}

async function bid(auctionId, amount) {
  const Auction = await ethers.getContractAt("Auction", AUCTION_ADDRESS);
  const tx = await Auction.bid(auctionId, { value: amount });
  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === "BidPlaced");
  if (!event) {
    throw new Error("BidPlaced event not found");
  }
  return {
    auctionId: event.args.auctionId.toString(),
    bidder: event.args.bidder,
    amount: event.args.amount.toString(),
  };
}

async function settleAuction(auctionId) {
  const Auction = await ethers.getContractAt("Auction", AUCTION_ADDRESS);
  const tx = await Auction.settleAuction(auctionId);
  const receipt = await tx.wait();
  const event = receipt.events.find(e => e.event === "AuctionSettled");
  if (!event) {
    throw new Error("AuctionSettled event not found");
  }
  return {
    auctionId: event.args.auctionId.toString(),
    winner: event.args.winner,
    amount: event.args.amount.toString(),
  };
}

module.exports = {
  mintNFT,
  buyNFT,
  createAuction,
  bid,
  settleAuction,
}; 