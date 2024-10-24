import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  acceptOrder,
  addWinnerCoin,
  adminCancelOrder,
  cancelMyOrder,
  createOrder,
  deleteOrder,
  getAdminOrders,
  getAllAcceptedOrders,
  getAllAdminAcceptedOrders,
  getAllOrders,
  getMyCreatedChallenges,
  getMyOrders,
  getOrderDetails,
  markWinner,
  processOrder,
  uploadWinScreenShort,
} from "../controllers/order.js";
import { multipleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
router.get("/my/:pageNo", isAuthenticated, getMyOrders);
router.get("/admin/:pageNo", isAuthenticated, isAdmin, getAdminOrders);
router.get("/allOrders/:pageNo", isAuthenticated, getAllOrders);
router.get("/allAcceptedOrders/:pageNo", isAuthenticated, getAllAcceptedOrders);
router.get(
  "/myCreatedChallenges/:pageNo",
  isAuthenticated,
  getMyCreatedChallenges
);
router.get(
  "/allAdminAcceptedOrders/:pageNo",
  isAuthenticated,
  getAllAdminAcceptedOrders
);
router.put("/markAsYouWin", isAuthenticated, markWinner);
router.put("/addWinnerCoin", isAuthenticated, addWinnerCoin);
router.delete("/deleteOrder", isAuthenticated, isAdmin, deleteOrder);
router.route("/single/:id").get(isAuthenticated, getOrderDetails);
router.route("/single/:id").put(isAuthenticated, isAdmin, processOrder);
router.post("/accept", isAuthenticated, acceptOrder);
router.post("/adminCancelOrder", isAuthenticated, adminCancelOrder);
router.post(
  "/uploadWinScreenShort",
  isAuthenticated,
  multipleFileUpload,
  uploadWinScreenShort
);
router.delete("/cancelMyOrder", isAuthenticated, cancelMyOrder);

export default router;
