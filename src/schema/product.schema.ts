import z from "zod";

export const allowedFileTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(3).max(100),
  price: z.number().min(5000),
  categoryId: z.number().min(1),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
