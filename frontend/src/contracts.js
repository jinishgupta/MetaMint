import marketplaceAbi from '../../backend-web3/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';
import { BrowserProvider, Contract } from 'ethers';

const MARKETPLACE_ABI = marketplaceAbi.abi;
const MARKETPLACE_ADDRESS = '0xdA5AF4929ecc89fF8a32227B015BAF94BB643C65' ;

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
  }
};