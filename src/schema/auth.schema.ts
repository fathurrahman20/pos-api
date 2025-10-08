import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.email(),
  role: z.enum(["admin", "kasir"]).optional(),
  password: z.string().min(6),
});
export type RegisterUserData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});
export type LoginUserData = z.infer<typeof loginSchema>;
