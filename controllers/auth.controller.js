import { User } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.util.js";
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists, please use another email!",
      });
    }

    const hashedPassword = await hashPassword(password);

    // ✅ Cloudinary image URL
    const profileImage = req.file
      ? req.file.path // Cloudinary secure URL
      : null;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      profile: profileImage,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong!",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fileds are required!",
      });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    const isMatch = await comparePassword(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "invalid or wrong password",
      });
    }
    // Access token (short-lived)
    const accessToken = generateAccessToken({
      _id: existingUser._id,
      role: existingUser.role,
    });
    // Refresh token (long-lived)
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
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: existingUser,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};
const logout = async (req, res) => {
  try {
    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };
    // Clear refresh token cookie
    res.clearCookie("refreshToken", cookieOptions);
    // Clear access token cookie (optional but recommended)
    res.clearCookie("accessToken", cookieOptions);
    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "something went wrong!",
    });
  }
};

export { register, login, logout };
