import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    googleId:{
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
    },
    profilePicture: {
        type: String,
        default: ''
    }
});

const User = mongoose.model('User', userSchema);
export default User;