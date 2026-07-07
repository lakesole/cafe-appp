import { Request, Response, NextFunction } from "express";
import * as orderService from "../../services/order.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const orders = await orderService.listOrdersForStaff(status);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderForStaff(Number(req.params.id));
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.updateOrderStatusByStaff(Number(req.params.id), req.body.status);
    res.json(order);
  } catch (err) {
    next(err);
  }
}
