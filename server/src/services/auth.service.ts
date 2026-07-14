import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { HttpError } from "../utils/http-error";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

export type TokenPayload = {
  sub: number;
  username: string;
  name: string;
  role: "CUSTOMER" | "STAFF" | "ADMIN";
};

function toPayload(user: { id: number; username: string; name: string; role: string }): TokenPayload {
  return { sub: user.id, username: user.username, name: user.name, role: user.role as TokenPayload["role"] };
}

export function signAccessToken(user: { id: number; username: string; name: string; role: string }) {
  return jwt.sign(toPayload(user), ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export function signRefreshToken(user: { id: number; username: string; name: string; role: string }) {
  return jwt.sign(toPayload(user), REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as unknown as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as unknown as TokenPayload;
}

export async function signup(data: { username: string; password: string; name: string; phone?: string }) {
  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) throw new HttpError(409, "이미 사용 중인 아이디입니다.");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { username: data.username, passwordHash, name: data.name, phone: data.phone },
  });

  return user;
}

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) throw new HttpError(401, "아이디 또는 비밀번호가 올바르지 않습니다.");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, "아이디 또는 비밀번호가 올바르지 않습니다.");

  return user;
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}
