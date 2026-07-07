/* ============================================
   관리자 - 매출 통계 (실제 API 연동: GET /api/admin/stats)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

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

  document.getElementById("top-menu-list").innerHTML = stats.topMenus.length
    ? stats.topMenus
        .map(
          (m, i) => `
        <li class="rank-item">
          <span class="rank-item__rank">${i + 1}</span>
          <span class="rank-item__name">${m.name}</span>
          <span class="rank-item__count">${m.count}개 판매</span>
        </li>`
        )
        .join("")
    : `<li class="rank-item">최근 7일간 판매 데이터가 없습니다.</li>`;

  const maxAmount = Math.max(1, ...stats.weekly.map((d) => d.amount));
  document.getElementById("bar-chart").innerHTML = stats.weekly
    .map(
      (d) => `
      <div class="bar">
        <div class="bar__fill" style="height:${Math.round((d.amount / maxAmount) * 100)}%"></div>
        <span class="bar__label">${d.label}</span>
      </div>`
    )
    .join("");
}

init();

}
