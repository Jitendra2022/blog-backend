import express from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
const authRoutes = express.Router();
authRoutes.post("/register", upload("user-images").single("profile"), register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
export default authRoutes;
