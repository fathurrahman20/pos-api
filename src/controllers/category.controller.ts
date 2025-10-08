import { Request, Response } from "express";
import { categoriesServices } from "../services/category.service";
import {
  createCategorySchema,
  getCategorySchema,
  updateCategorySchema,
} from "../schema/category.schema";
import BadRequestError from "../errors/bad-request.error";

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await categoriesServices.getAllCategories();

  res.status(200).json({
    success: true,
    message: "Successfully get all categories",
    data: categories,
  });
};

export const getCategory = async (req: Request, res: Response) => {
  const id = getCategorySchema.parse(Number(req.params.id)) as number;

  if (typeof id !== "number" || isNaN(id)) {
    throw new BadRequestError("ID must be a number.");
  }

  const category = await categoriesServices.getCategoryById(id);

  res.status(200).json({
    success: true,
    message: "Successfully get category",
    data: category,
  });
};

export const createCategory = async (req: Request, res: Response) => {
  const validatedData = createCategorySchema.parse(req.body);

  const newCategory = await categoriesServices.createCategory(validatedData);

  res.status(201).json({
    success: true,
    message: "Successfully create category",
    data: newCategory,
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const validatedData = updateCategorySchema.parse(req.body);

  if (typeof id !== "number" || isNaN(id)) {
    throw new BadRequestError("ID must be a number.");
  }

  const updatedCategory = await categoriesServices.updateCategory(
    id,
    validatedData
  );

  res.status(200).json({
    success: true,
    message: "Successfully update category",
    data: updatedCategory,
  });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (typeof id !== "number" || isNaN(id)) {
    throw new BadRequestError("ID must be a number.");
  }

  await categoriesServices.deleteCategory(id);

  res.status(200).json({
    success: true,
    message: "Successfully delete category",
  });
};
