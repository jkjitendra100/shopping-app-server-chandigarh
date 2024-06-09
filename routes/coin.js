import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { singleFileUpload } from "../middlewares/multer.js";
import {
  UpdateCoinToUserProfile,
  addCoinRequest,
  getAllCoinRequests,
  getMyCoinRequests,
  rejectCoin,
  updateCoin,
} from "../controllers/coin.js";

const router = express.Router();

router.post("/add", isAuthenticated, singleFileUpload, addCoinRequest);
router.get("/all", isAuthenticated, isAdmin, getAllCoinRequests);
router.get("/my", isAuthenticated, getMyCoinRequests);
router.put("/update", isAuthenticated, isAdmin, updateCoin);
router.put("/reject/:id", isAuthenticated, isAdmin, rejectCoin); // Document id of coin collection
router.put("/addCoinToUserId", isAuthenticated, isAdmin, UpdateCoinToUserProfile); // Document id of coin collection
export default router;
