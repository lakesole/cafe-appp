import { prisma } from "../prisma";

export function listMenuItems() {
  return prisma.menuItem.findMany({
    include: { category: true, optionGroups: { include: { optionChoices: true } } },
    orderBy: { id: "asc" },
  });
}

/** 고객 노출용: isAvailable(판매 중단이 아닌) 메뉴만 반환 */
export function listAvailableMenuItems() {
  return prisma.menuItem.findMany({
    where: { isAvailable: true },
    include: { category: true, optionGroups: { include: { optionChoices: true } } },
    orderBy: { id: "asc" },
  });
}

export function getMenuItem(id: number) {
  return prisma.menuItem.findUnique({
    where: { id },
    include: { category: true, optionGroups: { include: { optionChoices: true } } },
  });
}

export function createMenuItem(data: {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isSoldOut?: boolean;
  isAvailable?: boolean;
}) {
  return prisma.menuItem.create({ data });
}

export function updateMenuItem(
  id: number,
  data: Partial<{
    categoryId: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isSoldOut: boolean;
    isAvailable: boolean;
  }>
) {
  return prisma.menuItem.update({ where: { id }, data });
}

export function deleteMenuItem(id: number) {
  return prisma.menuItem.delete({ where: { id } });
}
