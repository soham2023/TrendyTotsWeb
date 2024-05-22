const cloudinary = require("cloudinary").v2;
require('dotenv').config();
// refer to env
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const uploadFile = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        console.log(result);
        return result;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        throw new Error("Failed to upload file to Cloudinary");
    }
};

module.exports = {
    uploadFile
};
