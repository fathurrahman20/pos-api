import { Router } from "express";
import {
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const authRoutes = Router();
authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);
authRoutes.get("/auth/me", authenticate, getCurrentUser);
authRoutes.get("/auth/refresh", authenticate, refreshToken);
authRoutes.delete("/auth/logout", authenticate, logout);

export default authRoutes;
