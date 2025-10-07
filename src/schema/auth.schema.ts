import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.email(),
  role: z.enum(["admin", "kasir"]).optional(),
  password: z.string().min(6),
});
