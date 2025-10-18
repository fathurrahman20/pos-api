import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const authRoutes = Router();
authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);
authRoutes.post("/auth/forgot-password", forgotPassword);
authRoutes.post("/auth/reset-password/:token", resetPassword);
authRoutes.get("/auth/me", authenticate, getCurrentUser);
authRoutes.get("/auth/refresh", authenticate, refreshToken);
authRoutes.delete("/auth/logout", authenticate, logout);

export default authRoutes;
