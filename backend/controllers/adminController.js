import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// @desc  Get dashboard stats
// @route GET /api/admin/stats
// @access Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const paidOrders = await Order.find({ isPaid: true });
  const totalSales = paidOrders.reduce((acc, o) => acc + o.totalPrice, 0);

  const recentOrders = await Order.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  const lowStockProducts = await Product.find({ stock: { $lte: 5 }, isActive: true })
    .select("name stock")
    .limit(5);

  // Sales for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const salesByDay = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        total: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const orderStatusCounts = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
      recentOrders,
      lowStockProducts,
      salesByDay,
      orderStatusCounts,
    },
  });
});

// @desc  Get all users
// @route GET /api/admin/users
// @access Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// @desc  Update user role / active status
// @route PUT /api/admin/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (req.body.role) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

  const updated = await user.save();
  res.json({
    success: true,
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
    },
  });
});

// @desc  Delete user
// @route DELETE /api/admin/users/:id
// @access Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete an admin account");
  }

  await user.deleteOne();
  res.json({ success: true, message: "User removed" });
});
