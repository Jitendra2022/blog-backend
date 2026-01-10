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
blogRoutes.post(
  "/create",
  authenticateJWT,
  verifyRole("admin"),
  upload("blog-images").single("image"),
  create
);
blogRoutes.delete(
  "/delete/:id",
  authenticateJWT,
  verifyRole("admin"),
  deletePost
);
blogRoutes.patch(
  "/update/:id",
  authenticateJWT,
  verifyRole("admin"),
  upload("blog-images").single("image"),
  updatePost
);
blogRoutes.get("/posts", getPosts);
export default blogRoutes;
