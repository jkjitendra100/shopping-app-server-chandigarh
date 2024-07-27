import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

import { addWithdrawRequest } from "../controllers/withdraw.js";

const router = express.Router();

router.post("/new", isAuthenticated, addWithdrawRequest);

export default router;
