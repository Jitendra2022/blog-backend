import express from "express";
import { addComment } from "../controllers/comment.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
const commentRoutes = express.Router();
commentRoutes.post("/add-comment", authenticateJWT, addComment);
export default commentRoutes;
