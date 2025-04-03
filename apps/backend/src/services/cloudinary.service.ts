import { v2 as cloudinary } from "cloudinary";
import { logger } from "./logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (imageDataURL: string) => {
  try {
    const result = await cloudinary.uploader.upload(imageDataURL, {
      resource_type: "image",
      folder: "age-lens",
    });

    return result.public_id;
  } catch (error) {
    logger.error({
      msg: "Failed to upload image to Cloudinary",
      error,
    });
    throw error;
  }
};
