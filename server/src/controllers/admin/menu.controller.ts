import { Request, Response } from "express";
import * as menuService from "../../services/menu.service";

export async function list(req: Request, res: Response) {
  const menuItems = await menuService.listMenuItems();
  res.json(menuItems);
}

export async function get(req: Request, res: Response) {
  const menuItem = await menuService.getMenuItem(Number(req.params.id));
  if (!menuItem) return res.status(404).json({ message: "메뉴를 찾을 수 없습니다." });
  res.json(menuItem);
}

export async function create(req: Request, res: Response) {
  const { categoryId, name, description, price, imageUrl, isSoldOut, isAvailable } =
    req.body;
  const menuItem = await menuService.createMenuItem({
    categoryId: Number(categoryId),
    name,
    description,
    price: Number(price),
    imageUrl,
    isSoldOut,
    isAvailable,
  });
  res.status(201).json(menuItem);
}

export async function update(req: Request, res: Response) {
  const { categoryId, name, description, price, imageUrl, isSoldOut, isAvailable } =
    req.body;
  const menuItem = await menuService.updateMenuItem(Number(req.params.id), {
    categoryId: categoryId !== undefined ? Number(categoryId) : undefined,
    name,
    description,
    price: price !== undefined ? Number(price) : undefined,
    imageUrl,
    isSoldOut,
    isAvailable,
  });
  res.json(menuItem);
}

export async function remove(req: Request, res: Response) {
  await menuService.deleteMenuItem(Number(req.params.id));
  res.status(204).end();
}
