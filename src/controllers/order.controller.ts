import { Request, Response } from "express";
import { orderServices } from "../services/order.service";

export const getAllOrders = async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const pageAsNumber = page ? parseInt(page as string) : 1;
  const limitAsNumber = limit ? parseInt(limit as string) : 10;

  const orders = await orderServices.getAllOrders(pageAsNumber, limitAsNumber);

  res.status(200).json({
    success: true,
    message: "Successfully get all orders",
    data: orders,
  });
};
