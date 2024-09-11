import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

import {
  addWithdrawRequest,
  getAllRequests,
  markAsPaid,
} from "../controllers/withdraw.js";

const router = express.Router();

router.post("/new", isAuthenticated, addWithdrawRequest);
router.put("/update/:requestId", isAuthenticated, markAsPaid);
router.get("/all/:pageNo/:pageSize", isAuthenticated, getAllRequests);

export default router;
