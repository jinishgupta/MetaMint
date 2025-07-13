import express from 'express';
import { registerUser, loginUser ,logoutUser, authMiddleware, getProfile, updateProfile, changePassword, googleLogin, verifyEmail } from './authController.js';
import { upload } from './cloudinary.js'; // multer config
import {
  uploadImageToIPFS,
  uploadDataToIPFS,
  getDataByCid,
  listDataByGroup,
  listDataByName,
  updateOnPinata
} from './ipfs.js';

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

// IPFS Routes
router.post('/upload-image', upload.single('file'), uploadImageToIPFS); // image upload
router.post('/upload-data', uploadDataToIPFS); // metadata upload (JSON only)
router.get('/data/:cid', getDataByCid);
router.get('/data-group', listDataByGroup);
router.get('/data-name', listDataByName);
router.post('/update-pinata', updateOnPinata);

export default router;