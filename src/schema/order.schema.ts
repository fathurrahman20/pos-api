import z from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().min(3).max(100),
  orderType: z.enum(["dine-in", "take-away"]),
  tableNumber: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.number().min(1),
      quantity: z.number().min(1),
      price: z.number().min(5000),
      notes: z.string().optional(),
    })
  ),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
