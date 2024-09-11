import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  acceptOrder,
  cancelMyOrder,
  createOrder,
  deleteOrder,
  getAdminOrders,
  getAllOrders,
  getMyOrders,
  getOrderDetails,
  processOrder,
} from "../controllers/order.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
// router.post("/payment", isAuthenticated, processPayment);
router.get("/my/:pageNo", isAuthenticated, getMyOrders);
router.get("/admin/:pageNo", isAuthenticated, isAdmin, getAdminOrders);
router.get("/allOrders/:pageNo", isAuthenticated, getAllOrders);
router.delete("/deleteOrder", isAuthenticated, isAdmin, deleteOrder);
router.route("/single/:id").get(isAuthenticated, getOrderDetails);
router.route("/single/:id").put(isAuthenticated, isAdmin, processOrder);
router.post("/accept", isAuthenticated, acceptOrder);
router.delete("/cancelMyOrder", isAuthenticated, cancelMyOrder);

export default router;
