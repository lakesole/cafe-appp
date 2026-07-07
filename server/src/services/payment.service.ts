import { prisma } from "../prisma";
import { HttpError } from "../utils/http-error";
import * as orderService from "./order.service";
import { emitNewOrder } from "../sockets";

/** 모의 결제: 항상 성공 처리 (실 PG 연동은 추후 별도 진행) */
export async function payMock(orderId: number, userId: number, method: string) {
  const order = await orderService.getOrderForUser(orderId, userId);

  if (order.status !== "PENDING") {
    throw new HttpError(400, "이미 결제되었거나 결제할 수 없는 주문입니다.");
  }

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      method,
      amount: order.totalPrice,
      status: "SUCCESS",
      pgTransactionId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      paidAt: new Date(),
    },
  });

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID" },
    include: { items: true, payment: true, user: { select: { name: true } } },
  });

  emitNewOrder(updatedOrder);

  return { order: updatedOrder, payment };
}
