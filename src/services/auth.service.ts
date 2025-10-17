import bcrypt from "bcrypt";
import { Op } from "sequelize";
import ConflictError from "../errors/conflict.error";
import ForbiddenError from "../errors/forbidden.error";
import NotFoundError from "../errors/not-found.error";
import UnauthorizedError from "../errors/unauthorized.error";
import { sequelize, User, UserSettings } from "../models";
import { LoginUserData, RegisterUserData } from "../schema/auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";

const SALT_ROUNDS = 10;

export const authService = {
  async registerUser(userData: RegisterUserData) {
    const { username, email, password, role } = userData;
    const transaction = await sequelize.transaction();

    if (role && role === "admin") {
      await transaction.rollback();
      throw new ForbiddenError("Tidak dapat mendaftar sebagai admin.");
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: email }],
      },
      transaction,
    });

    if (user) {
      await transaction.rollback();
      throw new ConflictError("Username atau email sudah terdaftar.");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create(
      {
        username,
        email,
        password: hashedPassword,
        role: "kasir",
      },
      { transaction }
    );

    await UserSettings.create(
      {
        userId: newUser.id,
        language: "Indonesia",
        preferenceMode: "light",
        fontSize: 16,
        zoomDisplay: 100,
      },
      { transaction }
    );

    await transaction.commit();

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };
  },
  async loginUser(userData: LoginUserData) {
    const { username, password } = userData;
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedError("Username atau password salah");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Username atau password salah");
    }

    const accessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  },
  async getCurrentUser(userId: number) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError("User tidak ditemukan");
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  },

  async refreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded || typeof decoded === "string") {
      throw new ForbiddenError("Refresh token tidak valid.");
    }

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    });

    return {
      newAccessToken,
    };
  },
};
