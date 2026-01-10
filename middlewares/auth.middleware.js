import jwt from "jsonwebtoken";

/* ---------------- AUTHENTICATION MIDDLEWARE ---------------- */
const authenticateJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }
    console.error(err);
    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? "Authentication failed!"
          : "Something went wrong!",
      error: err.message,
    });
  }
};

/* ---------------- AUTHORIZATION (ROLE-BASED) MIDDLEWARE ---------------- */
const verifyRole = (role) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (userRole !== role) {
      return res.status(403).json({
        success: false,
        message: "Access denied!",
      });
    }
    // only runs if user exists AND role matches
    next();
  };
};
export { authenticateJWT, verifyRole };
