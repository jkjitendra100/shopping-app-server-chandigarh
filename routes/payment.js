import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { newPayment, updatePayment } from "../controllers/payment.js";
import { singleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuthenticated, singleFileUpload, newPayment);
router.patch("/:id", isAuthenticated, singleFileUpload, updatePayment);

export default router;
