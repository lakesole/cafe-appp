import { prisma } from "../prisma";

export function listCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getCategory(id: number) {
  return prisma.category.findUnique({ where: { id } });
}

export function createCategory(data: { name: string; sortOrder?: number }) {
  return prisma.category.create({ data });
}

export function updateCategory(
  id: number,
  data: { name?: string; sortOrder?: number }
) {
  return prisma.category.update({ where: { id }, data });
}

export function deleteCategory(id: number) {
  return prisma.category.delete({ where: { id } });
}
