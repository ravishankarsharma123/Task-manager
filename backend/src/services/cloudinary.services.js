import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ApiError from '../utils/ApiError.js';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

});

const uploadeFileToCloudinary = async (file) =>{
    const {path, mimetype, size} = file;
    if (!path || !mimetype || !size) {
        throw new ApiError(400, "Invalid file data", "File path, mimetype, and size are required");
    }

    try {
        const result = await cloudinary.uploader.upload(path,{
            resource_type: "auto",
        });

        const optimizedUrl = cloudinary.url(result.public_id, {
            fetch_format: "auto",
            quality: "auto",

        });


        fs.unlinkSync(path); // Delete the file after upload
        return {
            url: optimizedUrl,
            mimetype,
            size,   
        }



        
    } catch (error) {

        console.error("Error uploading file to Cloudinary:", error);
        fs.unlinkSync(path); // Ensure the file is deleted even if upload fails
        
        return null;
        
    }
}


export default uploadeFileToCloudinary;
