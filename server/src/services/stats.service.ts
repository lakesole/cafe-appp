import { OrderStatus } from "@prisma/client";
import { prisma } from "../prisma";

const ACTIVE_STATUSES: OrderStatus[] = ["PAID", "PREPARING", "READY", "COMPLETED"];
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export async function getStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const recentOrders = await prisma.order.findMany({
    where: { status: { in: ACTIVE_STATUSES }, createdAt: { gte: sevenDaysAgo } },
    include: { items: { include: { menuItem: { include: { category: true } } } } },
  });

  const todayOrders = recentOrders.filter((o) => o.createdAt >= todayStart);
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

  const statusBreakdown = ACTIVE_STATUSES.map((status) => ({
    status,
    count: todayOrders.filter((o) => o.status === status).length,
  }));

  const menuStats: Record<string, { count: number; revenue: number }> = {};
  const categoryStats: Record<string, { count: number; revenue: number }> = {};

  recentOrders.forEach((order) => {
    order.items.forEach((item) => {
      const lineRevenue = item.unitPrice * item.quantity;

      if (!menuStats[item.name]) menuStats[item.name] = { count: 0, revenue: 0 };
      menuStats[item.name].count += item.quantity;
      menuStats[item.name].revenue += lineRevenue;

      const categoryName = item.menuItem.category.name;
      if (!categoryStats[categoryName]) categoryStats[categoryName] = { count: 0, revenue: 0 };
      categoryStats[categoryName].count += item.quantity;
      categoryStats[categoryName].revenue += lineRevenue;
    });
  });

  const topMenus = Object.entries(menuStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, s]) => ({ name, count: s.count, revenue: s.revenue }));

  const categoryBreakdown = Object.entries(categoryStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([name, s]) => ({ name, count: s.count, revenue: s.revenue }));

  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayOrders = recentOrders.filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd);
    const amount = dayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    weekly.push({ label: WEEKDAY_LABELS[dayStart.getDay()], amount, orderCount: dayOrders.length });
  }

  return {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    statusBreakdown,
    topMenus,
    categoryBreakdown,
    weekly,
  };
}
