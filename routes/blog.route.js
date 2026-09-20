import express from "express";

import {
  create,
  deletePost,
  getPosts,
  updatePost,
} from "../controllers/blog.controller.js";

import { authenticateJWT, verifyRole } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/upload.middleware.js";

const blogRoutes = express.Router();

// =========================
// CREATE BLOG
// =========================
blogRoutes.post(
  "/create",
  authenticateJWT,
  verifyRole("admin"),
  upload.single("image"),
  create
);

// =========================
// DELETE BLOG
// =========================
blogRoutes.delete(
  "/delete/:id",
  authenticateJWT,
  verifyRole("admin"),
  deletePost
);

// =========================
// UPDATE BLOG
// =========================
blogRoutes.patch(
  "/update/:id",
  authenticateJWT,
  verifyRole("admin"),
  upload.single("image"),
  updatePost
);

// =========================
// GET ALL BLOG POSTS
// =========================
blogRoutes.get("/posts", getPosts);

export default blogRoutes;
