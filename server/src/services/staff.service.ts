import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { HttpError } from "../utils/http-error";

export function listStaff() {
  return prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    orderBy: { id: "asc" },
  });
}

export function getStaff(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createStaff(data: {
  email: string;
  password: string;
  name: string;
  role: "STAFF" | "ADMIN";
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new HttpError(409, "이미 사용 중인 이메일입니다.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { email: data.email, passwordHash, name: data.name, role: data.role },
  });
}

export function updateStaff(
  id: number,
  data: Partial<{ name: string; email: string; role: "STAFF" | "ADMIN" }>
) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteStaff(id: number) {
  await prisma.user.delete({ where: { id } });
}
