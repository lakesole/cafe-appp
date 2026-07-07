import { Request, Response, NextFunction } from "express";
import * as authService from "../../services/auth.service";
import { HttpError } from "../../utils/http-error";

function toUserResponse(user: { id: number; email: string; name: string; phone: string | null; role: string }) {
  return { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      throw new HttpError(400, "이메일, 비밀번호, 이름은 필수입니다.");
    }

    const user = await authService.signup({ email, password, name, phone });
    const accessToken = authService.signAccessToken(user);
    const refreshToken = authService.signRefreshToken(user);

    res.status(201).json({ user: toUserResponse(user), accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new HttpError(400, "이메일과 비밀번호를 입력해주세요.");
    }

    const user = await authService.login(email, password);
    const accessToken = authService.signAccessToken(user);
    const refreshToken = authService.signRefreshToken(user);

    res.json({ user: toUserResponse(user), accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new HttpError(400, "refreshToken이 필요합니다.");

    let payload;
    try {
      payload = authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new HttpError(401, "refreshToken이 유효하지 않습니다.");
    }

    const user = await authService.getUserById(payload.sub);
    if (!user) throw new HttpError(401, "사용자를 찾을 수 없습니다.");

    const accessToken = authService.signAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export function logout(req: Request, res: Response) {
  res.status(204).end();
}
