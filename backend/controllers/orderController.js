import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc  Create new order
// @route POST /api/orders
// @access Private
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.phone ||
    !shippingAddress.street ||
    !shippingAddress.city ||
    !shippingAddress.state ||
    !shippingAddress.postalCode
  ) {
    res.status(400);
    throw new Error("Please provide complete shipping address");
  }

  // Re-validate items & prices from DB (never trust client-sent prices)
  let itemsPrice = 0;
  const verifiedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.name || item.product}`);
    }
    if (product.stock < item.qty) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    const price = product.discountPrice > 0 ? product.discountPrice : product.price;
    itemsPrice += price * item.qty;
    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price,
      qty: item.qty,
    });
  }

  const shippingPrice = itemsPrice > 999 ? 0 : 49;
  const taxPrice = Math.round(itemsPrice * 0.18 * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod: paymentMethod || "Razorpay",
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  res.status(201).json({ success: true, order });
});

// @desc  Get logged in user's orders
// @route GET /api/orders/myorders
// @access Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc  Get order by id
// @route GET /api/orders/:id
// @access Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, order });
});

// @desc  Get all orders (admin)
// @route GET /api/orders
// @access Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 20;
  const page = Number(req.query.page) || 1;

  const filter = {};
  if (req.query.status && req.query.status !== "all") {
    filter.orderStatus = req.query.status;
  }

  const count = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc  Update order status (admin)
// @route PUT /api/orders/:id/status
// @access Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;
  if (status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }
  if (status === "Cancelled" && order.isPaid === false) {
    // restock items if cancelled before payment/shipping
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }
  }

  const updated = await order.save();
  res.json({ success: true, order: updated });
});
