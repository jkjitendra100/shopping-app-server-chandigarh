import express from "express";
import {
  getProductDetails,
  addNewProduct,
  updateProduct,
  addNewProductImage,
  deleteProductImage,
  deleteProduct,
  getAllAdminProducts,
  showCartItems,
  getProductOrdersReport,
} from "../controllers/product.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import { multipleFileUpload, singleFileUpload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/all", getAllAdminProducts);
router
  .route("/product/:id")
  .get(getProductDetails)
  .delete(isAuthenticated, isAdmin, deleteProduct);

router.put("/:id", isAuthenticated, isAdmin, singleFileUpload, updateProduct);
router.post(
  "/new",
  isAuthenticated,    
  isAdmin,
  multipleFileUpload,
  addNewProduct
);
router
  .route("/images/:id")
  .post(isAuthenticated, isAdmin, singleFileUpload, addNewProductImage)
  .delete(isAuthenticated, isAdmin, deleteProductImage);

// Get cart products
router.get("/cartItems", isAuthenticated, showCartItems);
router.get(`/getProductOrdersReport/:productId`, isAuthenticated, getProductOrdersReport)

export default router;
