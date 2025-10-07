import { Router } from "express";
import { register } from "../controllers/auth.controller";

const authRoutes = Router();
authRoutes.post("/auth/register", register);

export default authRoutes;
