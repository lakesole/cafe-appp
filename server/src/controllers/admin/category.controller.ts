import { Request, Response } from "express";
import * as categoryService from "../../services/category.service";

export async function list(req: Request, res: Response) {
  const categories = await categoryService.listCategories();
  res.json(categories);
}

export async function get(req: Request, res: Response) {
  const category = await categoryService.getCategory(Number(req.params.id));
  if (!category) return res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
  res.json(category);
}

export async function create(req: Request, res: Response) {
  const { name, sortOrder } = req.body;
  const category = await categoryService.createCategory({ name, sortOrder });
  res.status(201).json(category);
}

export async function update(req: Request, res: Response) {
  const { name, sortOrder } = req.body;
  const category = await categoryService.updateCategory(Number(req.params.id), {
    name,
    sortOrder,
  });
  res.json(category);
}

export async function remove(req: Request, res: Response) {
  await categoryService.deleteCategory(Number(req.params.id));
  res.status(204).end();
}
