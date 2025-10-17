import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { authenticate } from "../middleware/auth.middleware";
import {
  getUserSettings,
  updateUserSettings,
} from "../controllers/user-setting.controller";
import { upload } from "../utils/multer";

const userSettingRoutes = Router();

userSettingRoutes.use(async (_req, _res, next) => {
  cloudinary.config({
    secure: true,
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

  next();
});

userSettingRoutes.get("/settings", authenticate, getUserSettings);
userSettingRoutes.patch(
  "/settings",
  authenticate,
  upload.single("image"),
  updateUserSettings
);

export default userSettingRoutes;
