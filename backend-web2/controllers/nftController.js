import NFT from '../models/nft.js';

export const saveNFT = async (req, res) => {
  try {
    const { tokenId, owner, name, description, image, metadataUrl, price, isListed, auctionId } = req.body;
    let nft = await NFT.findOne({ tokenId });
    if (nft) {
      nft.owner = owner;
      nft.name = name;
      nft.description = description;
      nft.image = image;
      nft.metadataUrl = metadataUrl;
      nft.price = price;
      nft.isListed = isListed;
      nft.auctionId = auctionId;
      await nft.save();
    } else {
      nft = new NFT({ tokenId, owner, name, description, image, metadataUrl, price, isListed, auctionId });
      await nft.save();
    }
    res.json({ success: true, nft });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message }); 
  }
};

export const getAllNFTs = async (req, res) => {
  try {
    const nfts = await NFT.find();
    res.json({ success: true, nfts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Fetch NFT by tokenId
export const getNFTById = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const nft = await NFT.findOne({ tokenId });
    if (!nft) return res.status(404).json({ success: false, error: 'NFT not found' });
    res.json({ success: true, nft });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};