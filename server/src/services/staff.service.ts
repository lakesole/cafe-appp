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
  username: string;
  password: string;
  name: string;
  role: "STAFF" | "ADMIN";
}) {
  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) throw new HttpError(409, "이미 사용 중인 아이디입니다.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  return prisma.user.create({
    data: { username: data.username, passwordHash, name: data.name, role: data.role },
  });
}

export function updateStaff(
  id: number,
  data: Partial<{ name: string; username: string; role: "STAFF" | "ADMIN" }>
) {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteStaff(id: number) {
  await prisma.user.delete({ where: { id } });
}
