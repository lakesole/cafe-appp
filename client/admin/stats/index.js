/* ============================================
   관리자 - 매출 통계 (샘플 차트/숫자)
   ============================================ */

const { ORDERS } = window.SAMPLE_DATA;

const completedOrders = ORDERS.filter((o) => o.status !== "CANCELED");
const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalPrice, 0);
const totalOrders = completedOrders.length;
const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

document.getElementById("stat-cards").innerHTML = `
  <div class="stat-card">
    <p class="stat-card__label">오늘 매출</p>
    <p class="stat-card__value">${totalRevenue.toLocaleString("ko-KR")}원</p>
  </div>
  <div class="stat-card">
    <p class="stat-card__label">오늘 주문 수</p>
    <p class="stat-card__value">${totalOrders}건</p>
  </div>
  <div class="stat-card">
    <p class="stat-card__label">평균 주문 금액</p>
    <p class="stat-card__value">${avgOrderValue.toLocaleString("ko-KR")}원</p>
  </div>
`;

const menuCounts = {};
completedOrders.forEach((order) => {
  order.items.forEach((item) => {
    menuCounts[item.name] = (menuCounts[item.name] || 0) + item.quantity;
  });
});
const topMenus = Object.entries(menuCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

document.getElementById("top-menu-list").innerHTML = topMenus
  .map(
    ([name, count], i) => `
    <li class="rank-item">
      <span class="rank-item__rank">${i + 1}</span>
      <span class="rank-item__name">${name}</span>
      <span class="rank-item__count">${count}개 판매</span>
    </li>`
  )
  .join("");

/* 최근 7일 매출 (샘플) */
const weeklySample = [
  { label: "월", amount: 182000 },
  { label: "화", amount: 145000 },
  { label: "수", amount: 210000 },
  { label: "목", amount: 168000 },
  { label: "금", amount: 235000 },
  { label: "토", amount: 298000 },
  { label: "일", amount: 254000 },
];
const maxAmount = Math.max(...weeklySample.map((d) => d.amount));

document.getElementById("bar-chart").innerHTML = weeklySample
  .map(
    (d) => `
    <div class="bar">
      <div class="bar__fill" style="height:${Math.round((d.amount / maxAmount) * 100)}%"></div>
      <span class="bar__label">${d.label}</span>
    </div>`
  )
  .join("");
