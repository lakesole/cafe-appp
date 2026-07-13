import { SeatStatus } from "@prisma/client";
import { prisma } from "../prisma";

const SINGLETON_ID = 1;

export async function getStoreStatus() {
  const status = await prisma.storeStatus.findUnique({ where: { id: SINGLETON_ID } });
  if (status) return status;
  return prisma.storeStatus.create({ data: { id: SINGLETON_ID } });
}

export async function updateStoreStatus(seatStatus: SeatStatus) {
  return prisma.storeStatus.upsert({
    where: { id: SINGLETON_ID },
    update: { seatStatus },
    create: { id: SINGLETON_ID, seatStatus },
  });
}
