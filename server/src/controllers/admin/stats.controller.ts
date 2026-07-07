import { Request, Response, NextFunction } from "express";
import * as statsService from "../../services/stats.service";

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await statsService.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
