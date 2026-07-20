import express from "express";
import {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, admin);

router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

export default router;
