import { Request, Response } from "express";
import * as storeStatusService from "../../services/store-status.service";

export async function get(req: Request, res: Response) {
  const status = await storeStatusService.getStoreStatus();
  res.json(status);
}
