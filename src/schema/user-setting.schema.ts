import { z } from "zod";

export const updateUserSettingsSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.email().optional(),
  language: z.enum(["English", "Indonesia"]).optional(),
  preferenceMode: z.enum(["light", "dark"]).optional(),
  fontSize: z.number().min(10).max(24).optional(),
  zoomDisplay: z.number().min(50).max(150).optional(),
});

export type UpdateUserSettingsSchema = z.infer<typeof updateUserSettingsSchema>;
