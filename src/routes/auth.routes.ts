import { Router } from "express";
import {
  getCurrentUser,
  login,
  register,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/authMiddleware";

const authRoutes = Router();
authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);
authRoutes.get("/auth/me", authenticate, getCurrentUser);

export default authRoutes;
