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

export const forgotPasswordSchema = z.object({
  email: z.email("Format email tidak valid"),
});
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
