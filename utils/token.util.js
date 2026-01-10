import jwt from "jsonwebtoken";

/* ---------------- JWT ACCESS TOKEN GENERATOR ---------------- */
/**
 * Generate JWT Access Token
 * @param {Object} payload
 * Example payload:
 * {
 *   _id: existingUser._id,
 *   role: existingUser.role
 * }
 * @returns {String} JWT Access Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN, // e.g., "15m"
  });
};

/* ---------------- JWT REFRESH TOKEN GENERATOR ---------------- */
/**
 * Generate JWT Refresh Token
 * @param {Object} payload
 * Example payload:
 * {
 *   _id: existingUser._id,
 *   role: existingUser.role
 * }
 * @returns {String} JWT Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // e.g., "7d"
  });
};

/* ---------------- EXPORT TOKENS ---------------- */

export { generateAccessToken, generateRefreshToken };
