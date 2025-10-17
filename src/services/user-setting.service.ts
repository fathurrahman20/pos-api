import { Op, WhereOptions } from "sequelize";
import ConflictError from "../errors/conflict.error";
import NotFoundError from "../errors/not-found.error";
import { sequelize, User, UserSettings } from "../models";
import { UpdateUserSettingsSchema } from "../schema/user-setting.schema";
import { v2 as cloudinary } from "cloudinary";
import { Where } from "sequelize/types/utils";

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
    data: UpdateUserSettingsSchema,
    imagePath: string | undefined
  ) {
    const transaction = await sequelize.transaction();

    let whereConditions: WhereOptions<User> = {};

    if (data.username) {
      whereConditions = {
        [Op.or]: [{ username: data.username }],
      };
    }

    if (data.email) {
      whereConditions = {
        [Op.or]: [{ email: data.email }],
      };
    }

    if (data.username || data.email) {
      const isUsernameAndEmailExist = await User.findOne({
        where: whereConditions,
      });

      if (isUsernameAndEmailExist) {
        await transaction.rollback();
        throw new ConflictError("Username or email already exist");
      }
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
