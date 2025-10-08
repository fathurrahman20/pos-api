import { Router } from "express";
import {
  getAllCategories,
  getCategory,
} from "../controllers/category.controller";

const categoryRoutes = Router();
categoryRoutes.get("/categories", getAllCategories);
categoryRoutes.get("/categories/:id", getCategory);

export default categoryRoutes;
