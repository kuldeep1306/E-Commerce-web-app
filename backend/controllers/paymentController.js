import asyncHandler from "express-async-handler";
import crypto from "crypto";
import Razorpay from "razorpay";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

let razorpayInstance = null;

// Created on first use (not at import time) so a missing .env value gives a
// clear error only when a payment is actually attempted, instead of crashing
// the whole server on startup.
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      "Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
    );
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// @desc  Create a Razorpay order for an existing DB order
// @route POST /api/payment/create-order
// @access Private
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  const options = {
    amount: Math.round(order.totalPrice * 100), // in paise
    currency: "INR",
    receipt: `receipt_${order._id}`,
    notes: { orderId: order._id.toString() },
  };

  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.create(options);
  } catch (err) {
    // The Razorpay SDK throws error objects shaped like
    // { statusCode, error: { code, description } } instead of a normal
    // Error with a .message — surface the real reason instead of a blank one.
    const reason = err?.error?.description || err?.message || "Unknown Razorpay error";
    console.error("Razorpay order creation failed:", err);
    res.status(err?.statusCode === 401 ? 500 : 400);
    throw new Error(`Payment gateway error: ${reason}`);
  }

  res.json({
    success: true,
    razorpayOrder,
    key: process.env.RAZORPAY_KEY_ID,
    orderId: order._id,
    amount: options.amount,
  });
});

// @desc  Verify Razorpay payment signature & mark order paid
// @route POST /api/payment/verify
// @access Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    res.status(400);
    throw new Error("Missing payment verification details");
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    res.status(400);
    throw new Error("Payment verification failed - invalid signature");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = "Processing";
  order.paymentResult = {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    status: "paid",
  };

  await order.save();

  // Decrement stock now that payment is confirmed
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
  }

  res.json({ success: true, message: "Payment verified successfully", order });
});