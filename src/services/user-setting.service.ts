import { Op, WhereOptions } from "sequelize";
import ConflictError from "../errors/conflict.error";
import NotFoundError from "../errors/not-found.error";
import { sequelize, User, UserSettings } from "../models";
import { UpdateUserSettingsSchema } from "../schema/user-setting.schema";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";

export const userSettingsService = {
  async getUserSettingsById(userId: number) {
    const user = await User.findOne({
      where: { id: userId },
      include: [
        {
          model: UserSettings,
          as: "settings",
          attributes: { exclude: ["id", "userId", "createdAt", "updatedAt"] },
        },
      ],
      attributes: {
        exclude: ["password", "resetPasswordToken", "resetPasswordExpires"],
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  },

  async updateUserSettings(
    userId: number,
    username: string,
    email: string,
    data: UpdateUserSettingsSchema,
    imagePath: string | undefined
  ) {
    const transaction = await sequelize.transaction();

    const isNewPassword =
      data.password && data.password !== "" && data.password.length > 6;

    if (data.password && data.password !== "" && data.password.length > 6) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
    }

    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserSettings,
          as: "settings",
          attributes: ["language", "preferenceMode", "fontSize", "zoomDisplay"],
        },
      ],
    });

    if (!user) {
      await transaction.rollback();
      throw new NotFoundError("User not found");
    }

    const orConditions = [];
    if (data.username && data.username !== user.username) {
      orConditions.push({ username: data.username });
    }
    if (data.email && data.email !== user.email) {
      orConditions.push({ email: data.email });
    }

    if (orConditions.length > 0) {
      const existingUser = await User.findOne({
        where: {
          [Op.or]: orConditions,
          id: { [Op.ne]: userId },
        },
        transaction,
      });

      if (existingUser) {
        await transaction.rollback();
        throw new ConflictError("Username or email already exist");
      }
    }

    if (imagePath) {
      if (user.imageId) {
        await cloudinary.uploader.destroy(user.imageId);
      }
      const { public_id, url } = await cloudinary.uploader.upload(imagePath, {
        folder: "profile_pictures",
      });
      user.image = url;
      user.imageId = public_id;
    }

    user.username = data.username || user.username;
    user.email = data.email || user.email;
    user.password = isNewPassword
      ? data.password || user.password
      : user.password;
    user.status = data.status || user.status;

    let settings = await UserSettings.findOne({
      where: { userId },
      transaction,
    });

    if (settings) {
      settings.language = data.language || settings.language;
      settings.preferenceMode = data.preferenceMode || settings.preferenceMode;
      settings.fontSize = data.fontSize || settings.fontSize;
      settings.zoomDisplay = data.zoomDisplay || settings.zoomDisplay;
      await settings.save({ transaction });
    } else {
      await UserSettings.create(
        {
          userId,
          language: data.language || "Indonesia",
          preferenceMode: data.preferenceMode || "light",
          fontSize: data.fontSize || 16,
          zoomDisplay: data.zoomDisplay || 100,
        },
        { transaction }
      );
    }

    await user.save({ transaction });
    await transaction.commit();

    return this.getUserSettingsById(userId);
  },
};
