import express from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getProducts);

// Upload up to 3 product images (admin only). Returns public URLs to save
// into the product's `images` array from the client.
router.post("/upload-images", protect, admin, upload.array("images", 3), (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No images uploaded");
  }
  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ success: true, urls });
});

router.post("/", protect, admin, createProduct);
router.get("/:id", getProductById);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/reviews", protect, createProductReview);

export default router;
