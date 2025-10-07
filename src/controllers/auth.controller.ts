import { Request, Response } from "express";
import { registerSchema } from "../schema/auth.schema";
import { authService } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const validatedData = registerSchema.parse(req.body);

  const newUser = await authService.registerUser(validatedData);

  res.status(201).json({
    success: true,
    message: "Registrasi berhasil",
    data: {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  });
  return;
};
