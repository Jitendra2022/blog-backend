import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Create upload directory if it doesn't exist
 */
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Multer storage configuration
 */
const storage = (folderName = "general") =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("uploads", folderName);
      ensureDirExists(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

/**
 * File filter (only images example)
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const isValid =
    allowedTypes.test(file.mimetype) &&
    allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

/**
 * Reusable upload middleware
 * @param {String} folderName
 */
export const upload = (folderName) =>
  multer({
    storage: storage(folderName),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });
