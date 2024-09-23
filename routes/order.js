import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  acceptOrder,
  cancelMyOrder,
  createOrder,
  deleteOrder,
  getAdminOrders,
  getAllAcceptedOrders,
  getAllOrders,
  getMyOrders,
  getOrderDetails,
  processOrder,
  uploadWinScreenShort,
} from "../controllers/order.js";
import { multipleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
// router.post("/payment", isAuthenticated, processPayment);
router.get("/my/:pageNo", isAuthenticated, getMyOrders);
router.get("/admin/:pageNo", isAuthenticated, isAdmin, getAdminOrders);
router.get("/allOrders/:pageNo", isAuthenticated, getAllOrders);
router.get("/allAcceptedOrders/:pageNo", isAuthenticated, getAllAcceptedOrders);
router.delete("/deleteOrder", isAuthenticated, isAdmin, deleteOrder);
router.route("/single/:id").get(isAuthenticated, getOrderDetails);
router.route("/single/:id").put(isAuthenticated, isAdmin, processOrder);
router.post("/accept", isAuthenticated, acceptOrder);
router.post(
  "/uploadWinScreenShort",
  isAuthenticated,
  multipleFileUpload,
  uploadWinScreenShort
);
router.delete("/cancelMyOrder", isAuthenticated, cancelMyOrder);

export default router;
