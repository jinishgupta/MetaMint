import marketplaceAbi from './NFTMarketplace.json';
import { BrowserProvider, Contract } from 'ethers';

const MARKETPLACE_ABI = marketplaceAbi.abi;
const MARKETPLACE_ADDRESS = '0x6C1EF6ef10c42E7781dB71d2538452368A01195D' ;

// Dynamic contract initialization function
export const getNFTContract = async () => {
  const walletAddress = localStorage.getItem('walletAddress');
  if (!window.ethereum || !walletAddress) {
    throw new Error("No wallet found or not connected");
  }
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
};

// Legacy exports for backward compatibility (will be deprecated)
export const NFTcontract = {
  getCurrentToken: async () => {
    const contract = await getNFTContract();
    return contract.getCurrentToken();
  },
  getListPrice: async () => { 
    const contract = await getNFTContract();
    return contract.getListPrice();
  },
  mintNFT: async (tokenURI, price, options) => {
    const contract = await getNFTContract();
    return contract.mintNFT(tokenURI, price, options);
  },
  buyNFT: async (tokenId, options) => {
    const contract = await getNFTContract();
    return contract.buyNFT(tokenId, options);
  },
  getMyNFTs: async () => {
    const contract = await getNFTContract();
    return contract.getMyNFTs();
  },
  getAllNFTs: async () => {
    const contract = await getNFTContract();
    return contract.getAllNFTs();
  },
  relistNFT: async () => {
    const contract = await getNFTContract();
    return contract.relistNFT(tokenId, price);
  },
  // --- Auction Functions ---
  createAuction: async (tokenId, minBid, duration, auctionURI, options) => {
    const contract = await getNFTContract();
    return contract.createAuction(tokenId, minBid, duration, auctionURI, options);
  },
  placeBid: async (auctionId, name, options) => {
    const contract = await getNFTContract();
    return contract.placeBid(auctionId, name, options);
  },
  settleAuction: async (auctionId) => {
    const contract = await getNFTContract();
    return contract.settleAuction(auctionId);
  },
  getActiveAuctions: async () => {
    const contract = await getNFTContract();
    return contract.getActiveAuctions();
  },
  getNonActiveAuctions: async () => {
    const contract = await getNFTContract();
    return contract.getNonActiveAuctions();
  },
  getMyAuctions: async (userAddress) => {
    const contract = await getNFTContract();
    return contract.getMyAuctions(userAddress);
  },
  getAllBids: async (auctionId) => {
    const contract = await getNFTContract();
    return contract.getAllBids(auctionId);
  },
  getCurrentAuctionId: async () => {
    const contract = await getNFTContract();
    return contract.getCurrentAuctionId();
  }
};