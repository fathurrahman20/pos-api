import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/product.controller";
import { upload } from "../utils/multer";
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware";

const productRoutes = Router();

productRoutes.use(async (_req, _res, next) => {
  cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

  next();
});

productRoutes.get("/products", getAllProducts);
productRoutes.get("/products/:id", getProductById);
productRoutes.post(
  "/products",
  upload.single("image"),
  authenticate,
  authorizeAdmin,
  createProduct
);
productRoutes.patch(
  "/products/:id",
  upload.single("image"),
  authenticate,
  authorizeAdmin,
  updateProduct
);
productRoutes.delete(
  "/products/:id",
  authenticate,
  authorizeAdmin,
  deleteProduct
);

export default productRoutes;
