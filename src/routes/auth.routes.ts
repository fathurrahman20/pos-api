import { Router } from "express";
import { login, register } from "../controllers/auth.controller";

const authRoutes = Router();
authRoutes.post("/auth/register", register);
authRoutes.post("/auth/login", login);

export default authRoutes;
