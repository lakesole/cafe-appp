import { Request, Response } from "express";
import * as menuService from "../../services/menu.service";

export async function list(req: Request, res: Response) {
  const menuItems = await menuService.listAvailableMenuItems();
  res.json(menuItems);
}

export async function get(req: Request, res: Response) {
  const menuItem = await menuService.getMenuItem(Number(req.params.id));
  if (!menuItem || !menuItem.isAvailable) {
    return res.status(404).json({ message: "메뉴를 찾을 수 없습니다." });
  }
  res.json(menuItem);
}
