import { prisma } from "../prisma";

const ACTIVE_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"] as const;
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const recentOrders = await prisma.order.findMany({
    where: { status: { in: ACTIVE_STATUSES as unknown as string[] }, createdAt: { gte: sevenDaysAgo } },
    include: { items: true },
  });

  const todayOrders = recentOrders.filter((o) => o.createdAt >= todayStart);
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const menuCounts: Record<string, number> = {};
  recentOrders.forEach((order) => {
    order.items.forEach((item) => {
      menuCounts[item.name] = (menuCounts[item.name] || 0) + item.quantity;
    });
  });
  const topMenus = Object.entries(menuCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const amount = recentOrders
      .filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd)
      .reduce((sum, o) => sum + o.totalPrice, 0);

    weekly.push({ label: WEEKDAY_LABELS[dayStart.getDay()], amount });
  }

  return { totalRevenue, totalOrders, avgOrderValue, topMenus, weekly };
}
