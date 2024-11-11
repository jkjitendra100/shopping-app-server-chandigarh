import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { requestAccountDeletion } from "../controllers/accountDeletion.js";

const router = express.Router();

router.delete("/deleteAccount", isAuthenticated, requestAccountDeletion);
export default router;
