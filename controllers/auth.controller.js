import { User } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.util.js";

import { getFileUrl, uploadFile } from "../services/s3.service.js";

// =========================
// REGISTER
// =========================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists, please use another email!",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Upload profile image to S3
    let profileImage = null;

    if (req.file) {
      profileImage = await uploadFile(req.file, "user-images");
    }

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      profile: profileImage,
    });

    // Generate signed URL for response
    const profileUrl = await getFileUrl(newUser.profile);

    return res.status(201).json({
      success: true,
      message: "Registration successful!",

      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile: profileUrl,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

// =========================
// LOGIN
// =========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // Find user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    // Compare password
    const isMatch = await comparePassword(password, existingUser.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid or wrong password",
      });
    }

    // Generate access token
    const accessToken = generateAccessToken({
      _id: existingUser._id,
      role: existingUser.role,
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      _id: existingUser._id,
      role: existingUser.role,
    });

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    // Save tokens in cookies
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    // Generate S3 signed URL
    const profileUrl = await getFileUrl(existingUser.profile);

    return res.status(200).json({
      success: true,
      message: "Login successful!",

      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        profile: profileUrl,
      },

      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

// =========================
// LOGOUT
// =========================
const logout = async (req, res) => {
  try {
    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    // Clear cookies
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (err) {
    console.error("Logout Error:", err);

    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

export { register, login, logout };
