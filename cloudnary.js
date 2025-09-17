import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
cloudinary.config({
  cloud_name: "dhulexn4l",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadoncld = async (localfilepath) => {
  try {
    if (!localfilepath) {
      return null;
    }
    const res = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localfilepath);
    console.log("File uploaded to Cloudinary:", res.url);
    return res.secure_url;
  } catch (error) {
    console.log(error)
    fs.unlinkSync(localfilepath);
    return null;
  }
};

export { uploadoncld };
