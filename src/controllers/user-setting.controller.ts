import { Request, Response } from "express";
import { updateUserSettingsSchema } from "../schema/user-setting.schema";
import { userSettingsService } from "../services/user-setting.service";
import UnauthorizedError from "../errors/unauthorized.error";

export const getUserSettings = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new UnauthorizedError("Authentication required.");
  }

  const settings = await userSettingsService.getUserSettingsById(userId);

  res.status(200).json({
    success: true,
    message: "Successfully retrieved user settings",
    data: settings,
  });
};

export const updateUserSettings = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const username = req.user?.username;
  const email = req.user?.email;

  if (!userId || !username || !email) {
    throw new UnauthorizedError("Authentication required.");
  }

  const requestBody = req.body;

  if (requestBody.fontSize) {
    requestBody.fontSize = parseInt(requestBody.fontSize, 10);
  }
  if (requestBody.zoomDisplay) {
    requestBody.zoomDisplay = parseInt(requestBody.zoomDisplay, 10);
  }

  const validatedData = updateUserSettingsSchema.parse(requestBody);

  const image = req.file?.path;

  const updatedSettings = await userSettingsService.updateUserSettings(
    userId,
    username,
    email,
    validatedData,
    image
  );

  res.status(200).json({
    success: true,
    message: "Successfully updated user settings",
    data: updatedSettings,
  });
};
