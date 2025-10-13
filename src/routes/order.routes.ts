import { Router } from "express";
import { getAllOrders } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";

const orderRoutes = Router();

orderRoutes.get("/orders", authenticate, getAllOrders);

export default orderRoutes;
