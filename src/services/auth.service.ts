import bcrypt from "bcrypt";
import { z } from "zod";
import { registerSchema } from "../schema/auth.schema";
import { sequelize, User } from "../models";
import ForbiddenError from "../errors/forbidden.error";
import { Op } from "sequelize";
import ConflictError from "../errors/conflict.error";

type RegisterUserData = z.infer<typeof registerSchema>;

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

    await transaction.commit();

    return {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };
  },
};
