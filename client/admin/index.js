/* ============================================
   관리자 - 대시보드 (ADMIN 로그인 가드 + 한눈에 보기)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {
  const ACTIVE_ORDER_STATUSES = ["PAID", "PREPARING", "READY"];

  function card({ href, label, value, sub, tone }) {
    return `
      <a class="dash-card ${tone ? `dash-card--${tone}` : ""}" href="${href}">
        <p class="dash-card__label">${label}</p>
        <p class="dash-card__value">${value}</p>
        ${sub ? `<p class="dash-card__sub">${sub}</p>` : ""}
      </a>`;
  }

  const SEAT_STATUS_LABEL = { AVAILABLE: "가능", FULL: "만석" };

  function renderSeatStatusControl(current) {
    const controlEl = document.getElementById("seat-status-control");
    controlEl.innerHTML = ["AVAILABLE", "FULL"]
      .map(
        (status) => `
        <button type="button" class="seat-status__btn ${status === current ? "is-active" : ""} ${status === "FULL" ? "seat-status__btn--full" : ""}" data-status="${status}">
          ${SEAT_STATUS_LABEL[status]}
        </button>`
      )
      .join("");

    controlEl.querySelectorAll("[data-status]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (btn.classList.contains("is-active")) return;
        const updated = await api.patch("/admin/store-status", { seatStatus: btn.dataset.status });
        renderSeatStatusControl(updated.seatStatus);
      });
    });
  }

  async function init() {
    const gridEl = document.getElementById("dashboard-grid");

    const [categories, menuItems, staff, orders, questions, stats, storeStatus] = await Promise.all([
      api.get("/admin/categories"),
      api.get("/admin/menu-items"),
      api.get("/admin/staff"),
      api.get("/staff/orders"),
      api.get("/admin/questions"),
      api.get("/admin/stats"),
      api.get("/admin/store-status"),
    ]);

    renderSeatStatusControl(storeStatus.seatStatus);

    const soldOutCount = menuItems.filter((m) => m.isSoldOut).length;
    const activeOrders = orders.filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status));
    const unansweredCount = questions.filter((q) => !q.answer).length;

    gridEl.innerHTML = [
      card({
        href: "/admin/orders/list",
        label: "진행 중인 주문",
        value: `${activeOrders.length}건`,
        sub: "결제완료 · 제조중 · 픽업대기",
        tone: "accent",
      }),
      card({
        href: "/admin/stats",
        label: "오늘 매출",
        value: `${stats.totalRevenue.toLocaleString("ko-KR")}원`,
        sub: `오늘 주문 ${stats.totalOrders}건`,
      }),
      card({
        href: "/admin/qna/list",
        label: "미답변 문의",
        value: `${unansweredCount}건`,
        sub: `전체 문의 ${questions.length}건`,
        tone: unansweredCount > 0 ? "warn" : "",
      }),
      card({
        href: "/admin/menus/list",
        label: "메뉴",
        value: `${menuItems.length}개`,
        sub: soldOutCount > 0 ? `품절 ${soldOutCount}개` : "품절 메뉴 없음",
      }),
      card({
        href: "/admin/categories/list",
        label: "카테고리",
        value: `${categories.length}개`,
      }),
      card({
        href: "/admin/staff/list",
        label: "종업원",
        value: `${staff.length}명`,
      }),
    ].join("");
  }

  init();
}
