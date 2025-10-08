import { Router } from "express";
import authRoutes from "./auth.routes";
import categoryRoutes from "./category.routes";

const router = Router();

router.use(authRoutes);
router.use(categoryRoutes);

export default router;
