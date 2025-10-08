import { Router } from "express";
import {
  getCurrentUser,
  login,
  refreshToken,
  register,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authMiddleware";

const authRoutes = Router();
authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);
authRoutes.get("/auth/me", authenticate, getCurrentUser);
authRoutes.get("/auth/refresh", authenticate, refreshToken);

export default authRoutes;
