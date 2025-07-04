import {v2 as cloudinary} from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();
cloudinary.config({
    cloud_name: 'dpzkvpl7m',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

async function audioUploadUtil(file) {
    const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto" ,
    }); 
    return result;
}

async function imageUploadUtil(file) {
    const result = await cloudinary.uploader.upload(file, {
        resource_type: "image",
    });
    return result;
}

const upload = multer({storage});

export { audioUploadUtil, imageUploadUtil, upload };