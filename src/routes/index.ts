import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";
import productRoutes from "./product.routes";

const router = Router();

router.use(authRoutes);
router.use(categoryRoutes);
router.use(productRoutes);

export default router;
