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
    console.log("Image Result: ", imageResult);
    res.json({
      success: true,
      imageCid: imageResult.cid,
      imageUrl: `${process.env.GATEWAY_URL}/ipfs/${imageResult.cid}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload NFT metadata JSON to IPFS (no file)
const uploadDataToIPFS = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    let groupId = undefined; // Use a local variable, not global
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
          console.error('Invalid or missing NFT category:', data.category);
          return res.status(400).json({ success: false, message: 'Invalid or missing NFT category' });
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
          groupId = "1a5190f2-45b7-4fda-93d6-7a8e1762e717";
          break;
        default:
          console.error('Invalid or missing collection category:', data.category);
          return res.status(400).json({ success: false, message: 'Invalid or missing collection category' });
      }
    }
    // Validate groupId
    if (!groupId || typeof groupId !== 'string' || !/^[0-9a-fA-F-]{36}$/.test(groupId)) {
      console.error('Invalid groupId:', groupId);
      return res.status(400).json({ success: false, message: 'Invalid groupId for Pinata group' });
    }
    let metadataUpload = pinata.upload.public.json(data).group(groupId);
    // Set the file name if provided
    if (data.name) {
      metadataUpload = metadataUpload.name(data.name + '.json');
    }
    const metadataResult = await metadataUpload;
    // Fallback: If group_id is not set in result, add file to group after upload
    if (!metadataResult.group_id || metadataResult.group_id !== groupId) {
      try {
        const addResult = await pinata.groups.public.addFiles({
          groupId: groupId,
          files: [metadataResult.id]
        });
        console.log('Added file to group after upload:', addResult);
      } catch (addErr) {
        console.error('Failed to add file to group after upload:', addErr);
      }
    }
    res.json({
      success: true,
      metadataCid: metadataResult.cid,
      metadataUrl: `${process.env.GATEWAY_URL}/ipfs/${metadataResult.cid}`
    });
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
    const urls = fileArray.map(file => {
      const cid = file.cid;
      if (!cid) return null;
      return `${process.env.GATEWAY_URL}/ipfs/${cid}`;
    }).filter(Boolean);
    res.json({ success: true, nfts: urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const listDataByName = async (req,res) => {
  try{
    const {name} = req.query;
    const fileResult = await pinata.files.public.list().name(name);
    const fileArray = Array.isArray(fileResult.files) ? fileResult.files : [];
    const urls = fileArray.map(file => {
      const cid = file.cid;
      if (!cid) return null;
      return `${process.env.GATEWAY_URL}/ipfs/${cid}`;
    }).filter(Boolean);
    res.json({ success: true, nfts: urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export {
  uploadImageToIPFS,
  uploadDataToIPFS,
  getDataByCid,
  listDataByGroup,
  listDataByName
};