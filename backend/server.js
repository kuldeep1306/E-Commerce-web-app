import dns from "node:dns";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import User from "./models/User.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// ==========================
// Config
// ==========================
dotenv.config();

// Fix DNS issue on Windows
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "uploads");

// ==========================
// Express App
// ==========================
const app = express();

// ==========================
// Middleware
// ==========================
app.use(
  helmet({
    // Default helmet policy blocks cross-origin <img> loads (e.g. frontend on
    // :5173 loading images from backend on :5000). Product images need to be
    // fetchable cross-origin, so relax just that policy.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded product images
app.use("/uploads", express.static(uploadsDir));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ==========================
// Rate Limiter
// ==========================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ==========================
// Routes
// ==========================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ==========================
// Error Middleware
// ==========================
app.use(notFound);
app.use(errorHandler);

// ==========================
// Default Admin
// ==========================
const ensureAdminExists = async () => {
  try {
    const adminExists = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (!adminExists) {
      await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      });

      console.log(`✅ Default admin created: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log("✅ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Could not ensure admin exists:", err);
  }
};

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    await ensureAdminExists();

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

console.log(process.env.RAZORPAY_KEY_ID);
console.log(
  process.env.RAZORPAY_KEY_SECRET ? "Secret Loaded" : "Secret Missing"
);

startServer();