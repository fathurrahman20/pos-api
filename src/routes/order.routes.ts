import { Router } from "express";
import { getAllOrders, getOrderById } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";

const orderRoutes = Router();

orderRoutes.get("/orders", authenticate, getAllOrders);
orderRoutes.get("/orders/:id", authenticate, getOrderById);

export default orderRoutes;
