import { Router } from "express";
import {
  getAllProducts,
  getProductById,
} from "../controllers/product.controller";

const productRoutes = Router();

productRoutes.get("/products", getAllProducts);
productRoutes.get("/products/:id", getProductById);

export default productRoutes;
