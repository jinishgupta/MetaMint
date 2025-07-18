import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './user.js'
import {OAuth2Client} from 'google-auth-library'
import { imageUploadUtil } from './cloudinary.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()


// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Send verification email
const sendVerificationEmail = (email, token) => {
  const link = `${process.env.CLIENT_URL}/api/verify?token=${token}`
  const mailOptions = {
    from: `GlobalVoiceAI <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email',
    html: `<h3>Click <a href="${link}">here</a> to verify your email and complete signup.</h3>`
  }
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err)
    else console.log('Verification email sent:', info.response)
  })
}

//register
const registerUser = async (req, res) => {
    console.log('[REGISTER] Incoming request:', req.body);
    const { userName, email, password } = req.body;

    
    // Validate required fields
    const missingFields = [];
    if (!userName) missingFields.push('userName');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Please provide ${missingFields.join(', ')}`
        });
    }

    // Sanitize and validate input
    if (/<|>|script/i.test(userName) || /<|>|script/i.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid characters in username or email.'
        });
    }

    try {
        const checkUser = await User.findOne({ email });
        if(checkUser) {
            console.log('[REGISTER] User already exists:', email);
            return res.status(400).json({
                success: false,
                message: "User already exists with same email"
            });
        }
        const hashPassword = await bcrypt.hash(password,12);
        const token = jwt.sign({ userName, email, password: hashPassword }, 'CLIENT_SECRET_KEY', { expiresIn: '15m' });
        sendVerificationEmail(email, token);
        console.log('[REGISTER] Verification email sent to:', email);
        res.status(200).json({
            success: true,
            message: "Verification email sent. Check your inbox to complete signup."
        });
    } catch(e) {
        const errorMessage = e.message || "Some error occurred";
        console.error('[REGISTER] Error:', errorMessage);
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
}

// Email verification route handler
const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Invalid token");
    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        const { userName, email, password } = decoded;
        const exists = await User.findOne({ email });
        if (exists) return res.send("Account already verified. Please login.");
        const newUser = new User({ userName, email, password });
        await newUser.save();
        res.status(200).send("Email verified successfully. You can now login.");
    } catch (err) {
        res.status(400).send("Invalid or expired token");
    }
}

//login

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Sanitize input
    if (/<|>|script/i.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid characters in email.'
      });
    }

    try{
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist with this email"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }
        const token = jwt.sign({ id: user._id, email: user.email, userName: user.userName}, 'CLIENT_SECRET_KEY', { expiresIn: '240m' });
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: true,
            sameSite: 'none',
            maxAge: 240 * 60 * 1000 // 240 minutes
        }).json({
            success: true,
            message: "Login successful",
            user: {
                email: user.email,
                id: user._id,
                userName: user.userName
            }
        });
    } catch(e) {
        res.status(500).json({
            success: false,
            message:"Some error occured"
        });
    }
}

//logout

const logoutUser = async (req, res) => {
    console.log('[LOGOUT] Incoming request. Cookies:', req.cookies);
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        }).json({
            success: true,
            message: "Logout successful"
        });
        console.log('[LOGOUT] Logout successful.');
    } catch (e) {
        console.error('[LOGOUT] Error:', e.message);
        res.status(500).json({
            success: false,
            message: "Some error occurred"
        });
    }
}

// sign in with google
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    // 1. Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, picture } = payload;

    // 2. Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        userName: name,
        googleId,
        profilePic: picture
      });
    }

    // 3. Create your own JWT
    const jwtToken = jwt.sign({
      id: user._id,
      email: user.email,
      userName: user.userName
    }, 'CLIENT_SECRET_KEY', { expiresIn: '6h' });

    // 4. Send HTTP-only cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 6 * 60 * 60 * 1000 // 6 hours
    }).json({
      success: true,
      message: "Google login successful",
      user: {
        email: user.email,
        id: user._id,
        userName: user.userName
      }
    });

  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};


//middleware

const authMiddleware = async (req, res, next) => {
    console.log('[AUTH_MIDDLEWARE] Cookies:', req.cookies);
    const token = req.cookies.token;
    if (!token) {
        console.log('[AUTH_MIDDLEWARE] No token found. Unauthorized.');
        return res.status(401).json({
            success: false,
            message: "Unauthorized user!"
        });
    }
    try {
        const decoded = jwt.verify(token, 'CLIENT_SECRET_KEY');
        req.user = await User.findById(decoded.id).select('-password');
        console.log('[AUTH_MIDDLEWARE] Authenticated user:', req.user?.email);
        next();
    } catch (e) {
        console.log('[AUTH_MIDDLEWARE] Invalid token.');
        return res.status(401).json({
            success: false,
            message: "Unauthorized user!"
        });
    }
}

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update profile (username, profilePicture)
const updateProfile = async (req, res) => {
  try {
    const { userName } = req.body;
    if (userName && /<|>|script/i.test(userName)) {
      return res.status(400).json({ success: false, message: 'Invalid characters in username.' });
    }
    let update = {};
    if (userName) update.userName = userName;
    if (req.file) {
      // Validate file type and size
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ success: false, message: 'Only image files are allowed.' });
      }
      if (req.file.size > 15 * 1024 * 1024) {
        return res.status(400).json({ success: false, message: 'File size exceeds 15MB.' });
      }
      // Upload image to Cloudinary
      const uploadResult = await imageUploadUtil("data:image/png;base64," + req.file.buffer.toString('base64'));
      if (uploadResult && uploadResult.success && uploadResult.url) {
        update.profilePicture = uploadResult.url;
      } else {
        console.error('Cloudinary upload failed:', uploadResult.error || uploadResult);
        return res.status(500).json({ success: false, message: 'Image upload failed', error: uploadResult.error });
      }
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { registerUser, loginUser , logoutUser , authMiddleware, getProfile, updateProfile, changePassword, googleLogin, verifyEmail };