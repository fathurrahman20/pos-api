import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
} from "../controllers/order.controller";
import { authenticate, authorizeCashier } from "../middleware/auth.middleware";

const orderRoutes = Router();

orderRoutes.get("/orders", authenticate, getAllOrders);
orderRoutes.get("/orders/:id", authenticate, getOrderById);
orderRoutes.post("/orders", authenticate, authorizeCashier, createOrder);

export default orderRoutes;
