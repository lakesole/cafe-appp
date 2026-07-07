import { Request, Response, NextFunction } from "express";
import * as orderService from "../../services/order.service";
import * as paymentService from "../../services/payment.service";
import { HttpError } from "../../utils/http-error";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.createOrder(req.user!.sub, {
      items: req.body.items,
      pickupTime: req.body.pickupTime,
    });
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

export async function listMine(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await orderService.listOrdersByUser(req.user!.sub);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await orderService.getOrderForUser(Number(req.params.id), req.user!.sub);
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function payMock(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, method } = req.body;
    if (!orderId || !method) throw new HttpError(400, "orderId와 method가 필요합니다.");

    const result = await paymentService.payMock(Number(orderId), req.user!.sub, method);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
