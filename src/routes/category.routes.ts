import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/category.controller";
import { authenticate, authorizeAdmin } from "../middleware/auth.middleware";

const categoryRoutes = Router();
categoryRoutes.get("/categories", getAllCategories);
categoryRoutes.get("/categories/:id", getCategory);
categoryRoutes.post(
  "/categories",
  authenticate,
  authorizeAdmin,
  createCategory
);
categoryRoutes.patch(
  "/categories/:id",
  authenticate,
  authorizeAdmin,
  updateCategory
);
categoryRoutes.delete(
  "/categories/:id",
  authenticate,
  authorizeAdmin,
  deleteCategory
);

export default categoryRoutes;
