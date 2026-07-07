import { NextFunction, Request, Response } from "express";
import { verifyAccessToken, TokenPayload } from "../services/auth.service";
import { HttpError } from "../utils/http-error";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "로그인이 필요합니다."));

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new HttpError(401, "토큰이 유효하지 않습니다."));
  }
}

export function requireRole(...roles: TokenPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "로그인이 필요합니다."));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "접근 권한이 없습니다."));
    }
    next();
  };
}
