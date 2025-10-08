import z, { ZodType } from "zod";

export const getCategorySchema: ZodType = z.number();
export const createCategorySchema = z.object({
  name: z.string().min(3).max(50),
});
export const updateCategorySchema = z.object({
  name: z.string().min(3).max(50).optional(),
});

export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
