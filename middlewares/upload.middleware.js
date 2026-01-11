import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

/**
 * Reusable Cloudinary upload middleware
 * @param {String} folderName
 */
export const upload = (folderName = "general") => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `blog/${folderName}`,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      transformation: [{ quality: "auto" }],
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });
};
