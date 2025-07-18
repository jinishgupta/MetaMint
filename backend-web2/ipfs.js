import dotenv from 'dotenv';
dotenv.config();

import { PinataSDK } from 'pinata';
import { Blob, File } from 'buffer';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL
});

// Upload image file to IPFS
const uploadImageToIPFS = async (req, res) => {
  try {
    const imageBlob = new Blob([req.file.buffer]);
    const imageFile = new File([imageBlob], req.file.originalname, { type: req.file.mimetype });
    let imageUpload = pinata.upload.public.file(imageFile);
    if (req.body.group) imageUpload = imageUpload.group(req.body.group);
    if (req.body.imageName) imageUpload = imageUpload.name(req.body.imageName);
    if (req.body.keyvalues) imageUpload = imageUpload.keyvalues(req.body.keyvalues);
    const imageResult = await imageUpload;
    res.json({
    success: true,
      imageCid: imageResult.cid,
      imageUrl: `${process.env.GATEWAY_URL}/ipfs/${imageResult.cid}`
    });
} catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Utility function to upload metadata JSON to IPFS (no file, just data)
async function uploadMetadataToIPFS(data) {
  // Sanitize and validate input
  if (typeof data.name === 'string' && /<|>|script/i.test(data.name)) {
    throw new Error('Invalid characters in name.');
  }
  if (typeof data.description === 'string' && /<|>|script/i.test(data.description)) {
    throw new Error('Invalid characters in description.');
  }
  // Limit metadata size
  if (JSON.stringify(data).length > 10 * 1024) {
    throw new Error('Metadata too large.');
  }
  let groupId = undefined;
  let category = typeof data.category === 'string' ? data.category.toLowerCase() : '';
  if (data.type === "auction") {
    groupId = "ce4e4980-e0d0-418b-b3ad-052ea43c533a";
  } else if (data.type === "nft") {
    switch (category) {
      case "art":
        groupId = "9b963d00-6a5e-4f88-81dc-db2d85d60740";
        break;
      case "gaming":
        groupId = "42430137-8d98-4c93-9d46-2828989b4619";
        break;
      case "pfp":
        groupId = "74db4341-87ce-4524-9392-897f03d06dd1";
        break;
      case "photography":
        groupId = "63de8052-6580-4731-ab47-6d46e0a3e8ba";
        break;
      default:
        throw new Error('Invalid or missing NFT category');
    }
  } else {
    switch (category) {
      case "art":
        groupId = "e3268fb7-1445-404f-a32b-7e69f98c92d5";
        break;
      case "gaming":
        groupId = "c05915ab-a37a-4f38-a794-6197b2299167";
        break;
      case "pfp":
        groupId = "1a5190f2-45b7-4fda-93d6-7a8e1762e717";
        break;
      case "photography":
        groupId = "547dcc55-66c1-483f-b05f-55240aeccc9b";
        break;
      default:
        throw new Error('Invalid or missing collection category');
    }
  }
  // Validate groupId
  if (!groupId || typeof groupId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(groupId)) {
    throw new Error('Invalid groupId for Pinata group');
  }
  let metadataUpload = pinata.upload.public.json(data).group(groupId);
  if (data.name) {
    metadataUpload = metadataUpload.name(data.name + '.json');
  }
  const metadataResult = await metadataUpload;
  // Fallback: If group_id is not set in result, add file to group after upload
  if (!metadataResult.group_id || metadataResult.group_id !== groupId) {
    try {
      await pinata.groups.public.addFiles({
        groupId: groupId,
        files: [metadataResult.id]
      });
    } catch (addErr) {}
  }
  return {
    success: true,
    metadataCid: metadataResult.cid,
    metadataUrl: `${process.env.GATEWAY_URL}/ipfs/${metadataResult.cid}`,
    id: metadataResult.id
  };
}

// Upload NFT metadata JSON to IPFS (no file)
const uploadDataToIPFS = async (req, res) => {
  try {
    const data = req.body;
    const result = await uploadMetadataToIPFS(data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get NFT metadata by CID
const getDataByCid = async (req, res) => {
  try {
    const { cid } = req.params;
    return `${process.env.GATEWAY_URL}/ipfs/${cid}`;
  } catch (error) {
    res.status(404).json({ success: false, message: 'NFT not found' });
  }
};

// List NFTs by group
const listDataByGroup = async (req, res) => {
  try {
    const { group } = req.query;
    if (!group) return res.status(400).json({ success: false, message: 'Group is required' });
    const filesResult = await pinata.files.public.list().group(group);
    // filesResult is an object: { files: [...], next_page_token: ... }
    const fileArray = Array.isArray(filesResult.files) ? filesResult.files : [];
    const nfts = fileArray.map(file => {
      const cid = file.cid;
      const id = file.id;
      if (!cid || !id) return null;
      return { url: `https://${process.env.GATEWAY_URL}/ipfs/${cid}`, id, cid };
    }).filter(Boolean);
    res.json({ success: true, nfts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listDataByName = async (req,res) => {
  try{
    const {name} = req.query;
    const fileResult = await pinata.files.public.list().name(name);
    const fileArray = Array.isArray(fileResult.files) ? fileResult.files : [];
    const nfts = fileArray.map(file => {
      const cid = file.cid;
      const id = file.id;
      if (!cid || !id) return null;
      return { url: `https://${process.env.GATEWAY_URL}/ipfs/${cid}`, id, cid };
    }).filter(Boolean);
    res.json({ success: true, nfts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    }
}

// General update function for Pinata (delete old, upload new, return new tokenURI)
const updateOnPinata = async (req, res) => {
  console.log('[IPFS UPDATE] Incoming request:', req.body);
  try {
    const { id, updatedData } = req.body;
    if (!id || !updatedData) {
      return res.status(400).json({ success: false, message: 'Missing id or updatedData' });
    }
    // 1. Delete the old file
    await pinata.files.public.delete([id]);
    // 2. Upload the new file using the same logic as uploadDataToIPFS
    const uploadResult = await uploadMetadataToIPFS(updatedData);
    res.json({
      success: true,
      ...uploadResult,
      message: 'File updated. Please update the tokenURI on-chain.'
    });
    console.log('[IPFS UPDATE] Update successful:', uploadResult);
  } catch (error) {
    console.error('[IPFS UPDATE] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  uploadImageToIPFS,
  uploadDataToIPFS,
  getDataByCid,
  listDataByGroup,
  listDataByName,
  updateOnPinata
};