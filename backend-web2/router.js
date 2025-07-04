import express from 'express';
import { registerUser, loginUser ,logoutUser, authMiddleware, getProfile, updateProfile, changePassword, googleLogin, verifyEmail } from './controllers/authController.js';
import { upload } from './cloudinary.js';
import { saveNFT, getAllNFTs, getNFTById } from './controllers/nftController.js';
import {saveAuction, getAllAuctions, getAuctionById} from './controllers/auctionController.js';

const router = express.Router();

//auth routes
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/google-login', googleLogin);
router.get('/verify', verifyEmail);
router.get('/check-auth', authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "User is authenticated",
        user: {
            email: req.user.email,
            id: req.user._id,
            userName: req.user.userName
        }
    });
});

// User profile routes
router.get('/user/profile', authMiddleware, getProfile); 
router.put('/user/profile', authMiddleware, upload.single('profilePicture'), updateProfile);
router.put('/user/password', authMiddleware, changePassword);

// NFT and Auction routes
router.post('/nft', saveNFT);
router.get('/nfts', getAllNFTs);
router.get('/nft/:tokenId', getNFTById);
router.post('/auction', saveAuction);
router.get('/auctions', getAllAuctions);
router.get('/auction/:auctionId', getAuctionById);

export default router;