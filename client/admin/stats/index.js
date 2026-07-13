/* ============================================
   관리자 - 매출 통계 (실제 API 연동: GET /api/admin/stats)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const STATUS_META = {
  PAID: { label: "결제 완료", color: "#6d8ba1" },
  PREPARING: { label: "제조 중", color: "#c8956d" },
  READY: { label: "픽업 대기", color: "#6b8e5a" },
  COMPLETED: { label: "완료", color: "#8a7a6d" },
};

async function init() {
  const stats = await api.get("/admin/stats");

  document.getElementById("stat-cards").innerHTML = `
    <div class="stat-card">
      <p class="stat-card__label">오늘 매출</p>
      <p class="stat-card__value">${stats.totalRevenue.toLocaleString("ko-KR")}원</p>
    </div>
    <div class="stat-card">
      <p class="stat-card__label">오늘 주문 수</p>
      <p class="stat-card__value">${stats.totalOrders}건</p>
    </div>
    <div class="stat-card">
      <p class="stat-card__label">평균 주문 금액</p>
      <p class="stat-card__value">${stats.avgOrderValue.toLocaleString("ko-KR")}원</p>
    </div>
  `;

  document.getElementById("status-breakdown").innerHTML = stats.statusBreakdown
    .map(
      (s) => `
      <div class="status-pill">
        <span class="status-pill__dot" style="background:${STATUS_META[s.status].color}"></span>
        <span class="status-pill__label">${STATUS_META[s.status].label}</span>
        <span class="status-pill__count">${s.count}건</span>
      </div>`
    )
    .join("");

  document.getElementById("top-menu-list").innerHTML = stats.topMenus.length
    ? stats.topMenus
        .map(
          (m, i) => `
        <li class="rank-item">
          <span class="rank-item__rank">${i + 1}</span>
          <span class="rank-item__name">${m.name}</span>
          <span class="rank-item__revenue">${m.revenue.toLocaleString("ko-KR")}원</span>
          <span class="rank-item__count">${m.count}개 판매</span>
        </li>`
        )
        .join("")
    : `<li class="rank-item">최근 7일간 판매 데이터가 없습니다.</li>`;

  const maxAmount = Math.max(1, ...stats.weekly.map((d) => d.amount));
  document.getElementById("bar-chart").innerHTML = stats.weekly
    .map(
      (d) => `
      <div class="bar" title="${d.label}요일 · ${d.orderCount}건 · ${d.amount.toLocaleString("ko-KR")}원">
        <span class="bar__amount">${d.amount > 0 ? d.amount.toLocaleString("ko-KR") : ""}</span>
        <div class="bar__fill" style="height:${Math.round((d.amount / maxAmount) * 100)}%"></div>
        <span class="bar__label">${d.label}</span>
      </div>`
    )
    .join("");

  const maxCategoryRevenue = Math.max(1, ...stats.categoryBreakdown.map((c) => c.revenue));
  document.getElementById("category-breakdown").innerHTML = stats.categoryBreakdown.length
    ? stats.categoryBreakdown
        .map(
          (c) => `
        <li class="category-row">
          <span class="category-row__name">${c.name}</span>
          <div class="category-row__bar-track">
            <div class="category-row__bar-fill" style="width:${Math.round((c.revenue / maxCategoryRevenue) * 100)}%"></div>
          </div>
          <span class="category-row__revenue">${c.revenue.toLocaleString("ko-KR")}원</span>
          <span class="category-row__count">${c.count}개</span>
        </li>`
        )
        .join("")
    : `<li class="category-row">최근 7일간 판매 데이터가 없습니다.</li>`;
}

init();

}
