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
import { sendEmail } from "../utils/nodemailer";
import crypto from "crypto";

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
        image: user.image,
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

  async requestPasswordReset(email: string) {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);

      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      const subject = "Permintaan Reset Password";
      const html = `
          <p>Halo! Kami menerima permintaan untuk mengatur ulang password akun Anda.</p>
          <p>Silakan klik link di bawah ini untuk membuat password baru:</p>
          <a href="${resetUrl}" target="_blank">Atur Ulang Password</a>
          <p>Link ini hanya berlaku selama 1 jam ke depan, ya.</p>
          <p>Kalau kamu tidak merasa meminta reset password, bisa abaikan saja email ini.</p>
          <p>Terima kasih!</p>
      `;

      await sendEmail(user.email, subject, html);
    }
    return;
  },

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedError("Token tidak valid atau sudah kedaluwarsa.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    const subject = "Password Berhasil Diubah";
    const html = `<p>Password Anda telah berhasil diubah. Anda sekarang bisa login dengan password baru.</p>`;
    await sendEmail(user.email, subject, html);

    return;
  },
};
