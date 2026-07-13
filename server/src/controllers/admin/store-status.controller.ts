import { Request, Response, NextFunction } from "express";
import * as storeStatusService from "../../services/store-status.service";
import { HttpError } from "../../utils/http-error";

export async function get(req: Request, res: Response) {
  const status = await storeStatusService.getStoreStatus();
  res.json(status);
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { seatStatus } = req.body;
    if (!["AVAILABLE", "FULL"].includes(seatStatus)) {
      throw new HttpError(400, "seatStatus는 AVAILABLE 또는 FULL이어야 합니다.");
    }
    const status = await storeStatusService.updateStoreStatus(seatStatus);
    res.json(status);
  } catch (err) {
    next(err);
  }
}
