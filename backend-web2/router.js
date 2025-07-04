import express from 'express';
import { registerUser, loginUser ,logoutUser, authMiddleware, getProfile, updateProfile, changePassword, googleLogin, verifyEmail } from './controllers/authController.js';
import { upload } from './cloudinary.js';

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

export default router;