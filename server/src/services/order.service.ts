import { prisma } from "../prisma";
import { HttpError } from "../utils/http-error";

type OrderItemInput = {
  menuItemId: number;
  quantity: number;
  optionChoiceIds?: number[];
};

async function buildOrderItem(input: OrderItemInput) {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: input.menuItemId },
    include: { optionGroups: { include: { optionChoices: true } } },
  });

  if (!menuItem || !menuItem.isAvailable) {
    throw new HttpError(400, `존재하지 않거나 판매하지 않는 메뉴입니다. (id: ${input.menuItemId})`);
  }
  if (menuItem.isSoldOut) {
    throw new HttpError(400, `"${menuItem.name}"은 품절된 메뉴입니다.`);
  }
  if (!input.quantity || input.quantity < 1) {
    throw new HttpError(400, "수량은 1개 이상이어야 합니다.");
  }

  const allChoices = menuItem.optionGroups.flatMap((g) =>
    g.optionChoices.map((c) => ({ ...c, groupName: g.name }))
  );

  const selected = (input.optionChoiceIds || []).map((choiceId) => {
    const choice = allChoices.find((c) => c.id === choiceId);
    if (!choice) throw new HttpError(400, "유효하지 않은 옵션 선택입니다.");
    return choice;
  });

  const extraTotal = selected.reduce((sum, c) => sum + c.extraPrice, 0);
  const unitPrice = menuItem.price + extraTotal;

  return {
    menuItemId: menuItem.id,
    name: menuItem.name,
    quantity: input.quantity,
    unitPrice,
    selectedOptions: selected.map((c) => ({
      groupName: c.groupName,
      choiceName: c.name,
      extraPrice: c.extraPrice,
    })),
  };
}

export async function createOrder(
  userId: number,
  data: { items: OrderItemInput[]; pickupTime?: string }
) {
  if (!data.items || data.items.length === 0) {
    throw new HttpError(400, "주문 항목이 없습니다.");
  }

  const items = await Promise.all(data.items.map(buildOrderItem));
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return prisma.order.create({
    data: {
      userId,
      totalPrice,
      pickupTime: data.pickupTime ? new Date(data.pickupTime) : undefined,
      items: { create: items },
    },
    include: { items: true },
  });
}

export function listOrdersByUser(userId: number) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderForUser(orderId: number, userId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, payment: true },
  });
  if (!order || order.userId !== userId) {
    throw new HttpError(404, "주문을 찾을 수 없습니다.");
  }
  return order;
}

export function getOrderById(orderId: number) {
  return prisma.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true } });
}

const STAFF_VISIBLE_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"] as const;

export function listOrdersForStaff(status?: string) {
  const statusFilter =
    status && (STAFF_VISIBLE_STATUSES as readonly string[]).includes(status)
      ? status
      : undefined;

  return prisma.order.findMany({
    where: { status: (statusFilter ?? { in: STAFF_VISIBLE_STATUSES as unknown as string[] }) as any },
    include: { items: true, user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getOrderForStaff(orderId: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: { select: { name: true } } },
  });
  if (!order) throw new HttpError(404, "주문을 찾을 수 없습니다.");
  return order;
}

export async function updateOrderStatusByStaff(orderId: number, status: string) {
  if (!(STAFF_VISIBLE_STATUSES as readonly string[]).includes(status)) {
    throw new HttpError(400, "허용되지 않는 상태값입니다.");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new HttpError(404, "주문을 찾을 수 없습니다.");

  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as any },
    include: { items: true, user: { select: { name: true } } },
  });
}
