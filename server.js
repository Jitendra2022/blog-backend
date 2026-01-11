import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./database/db.js";
import authRoutes from "./routes/auth.route.js";
import blogRoutes from "./routes/blog.route.js";
import commentRoutes from "./routes/comment.route.js";
import publicRoutes from "./routes/public.route.js";
const app = express();
const PORT = process.env.PORT || 8888;
// Simple way to serve uploads folder
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(morgan("dev"));
const allowedOrigins = [
  "https://blog-frontend-wine-five.vercel.app",
  "https://cors-prettier-crud-app-backend.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
/* ---------------- ROUTES ---------------- */
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);
app.use("/comment", commentRoutes);
app.use("/public", publicRoutes);
connectDB();
app.listen(PORT, () => {
  console.log(`Server listening at : http://localhost:${PORT}`);
});
