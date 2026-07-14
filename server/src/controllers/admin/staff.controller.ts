import { Request, Response, NextFunction } from "express";
import * as staffService from "../../services/staff.service";
import { HttpError } from "../../utils/http-error";

function toStaffResponse(user: { id: number; username: string; name: string; role: string; createdAt: Date }) {
  return { id: user.id, username: user.username, name: user.name, role: user.role, createdAt: user.createdAt };
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.listStaff();
    res.json(staff.map(toStaffResponse));
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.getStaff(Number(req.params.id));
    if (!staff) throw new HttpError(404, "종업원을 찾을 수 없습니다.");
    res.json(toStaffResponse(staff));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name || !["STAFF", "ADMIN"].includes(role)) {
      throw new HttpError(400, "아이디, 비밀번호, 이름, 역할(STAFF/ADMIN)은 필수입니다.");
    }
    const staff = await staffService.createStaff({ username, password, name, role });
    res.status(201).json(toStaffResponse(staff));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, username, role } = req.body;
    if (role && !["STAFF", "ADMIN"].includes(role)) {
      throw new HttpError(400, "역할은 STAFF 또는 ADMIN이어야 합니다.");
    }
    const staff = await staffService.updateStaff(Number(req.params.id), { name, username, role });
    res.json(toStaffResponse(staff));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await staffService.deleteStaff(Number(req.params.id));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
