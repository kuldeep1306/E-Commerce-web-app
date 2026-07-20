import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";

// @desc  Get all products (public) with search, filter, pagination
// @route GET /api/products
// @access Public
export const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const filter = { isActive: true };

  if (req.query.keyword) {
    filter.$text = { $search: req.query.keyword };
  }

  if (req.query.category && req.query.category !== "all") {
    filter.category = req.query.category;
  }

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  let sort = { createdAt: -1 };
  if (req.query.sort === "price_asc") sort = { price: 1 };
  if (req.query.sort === "price_desc") sort = { price: -1 };
  if (req.query.sort === "rating") sort = { ratings: -1 };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc  Get single product
// @route GET /api/products/:id
// @access Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate(
    "reviews.user",
    "name"
  );

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, product });
});

// @desc  Get distinct categories
// @route GET /api/products/categories
// @access Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  res.json({ success: true, categories });
});

// @desc  Create product
// @route POST /api/products
// @access Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock, images, brand, discountPrice, sku } =
    req.body;

  if (!name || !description || !price || !category || stock === undefined) {
    res.status(400);
    throw new Error("Please provide name, description, price, category and stock");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    images: images && images.length ? images : [],
    brand,
    discountPrice: discountPrice || 0,
    sku,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, product });
});

// @desc  Update product
// @route PUT /api/products/:id
// @access Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const fields = [
    "name",
    "description",
    "price",
    "discountPrice",
    "category",
    "brand",
    "images",
    "stock",
    "sku",
    "isActive",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  const updated = await product.save();
  res.json({ success: true, product: updated });
});

// @desc  Delete product
// @route DELETE /api/products/:id
// @access Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product removed" });
});

// @desc  Add product review
// @route POST /api/products/:id/reviews
// @access Private
export const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, message: "Review added" });
});
