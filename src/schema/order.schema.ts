import z from "zod";

export const createOrderSchema = z
  .object({
    customerName: z.string().min(3).max(100),
    orderType: z.enum(["dine-in", "take-away"]),
    tableNumber: z.string().optional(),
    amountPaid: z.number().min(1000),
    paymentMethod: z.enum(["cash", "credit", "debit", "transfer"]).optional(),
    items: z.array(
      z.object({
        productId: z.number().min(1),
        quantity: z.number().min(1),
        notes: z.string().optional(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    // validasi kondisional untuk tableNumber
    if (data.orderType === "dine-in" && !data.tableNumber) {
      ctx.addIssue({
        code: "custom",
        message: "Nomor meja wajib diisi untuk pesanan dine-in",
        path: ["tableNumber"],
      });
    }
    if (data.orderType === "take-away" && data.tableNumber) {
      ctx.addIssue({
        code: "custom",
        message: "Nomor meja tidak boleh diisi untuk pesanan take-away",
        path: ["tableNumber"],
      });
    }
  });

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
