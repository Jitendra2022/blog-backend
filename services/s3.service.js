import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.config.js";

// ========================================
// Configuration
// ========================================

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const SIGNED_URL_EXPIRATION = 60 * 60;
const generateObjectKey = (file, folder = "general") => {
  const extension = file.originalname.split(".").pop().toLowerCase();

  return `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
};

// ========================================
// Upload File
// ========================================

const uploadFile = async (file, folder = "general") => {
  if (!file) {
    return null;
  }
  const key = generateObjectKey(file, folder);
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });
  await s3Client.send(command);
  return key;
};

// ========================================
// Generate Signed URL
// ========================================

const getFileUrl = async (key) => {
  if (!key) {
    return null;
  }
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: SIGNED_URL_EXPIRATION,
  });
};

// ========================================
// Delete File
// ========================================

const deleteFile = async (key) => {
  if (!key) {
    return;
  }
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
};

// ========================================
// Export
// ========================================

export { uploadFile, getFileUrl, deleteFile };
