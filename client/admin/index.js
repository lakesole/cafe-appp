/* ============================================
   관리자 - 대시보드 (ADMIN 로그인 가드 + 한눈에 보기)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {
  const ACTIVE_ORDER_STATUSES = ["PAID", "PREPARING", "READY"];
  const STATUS_META = {
    PAID: { label: "결제 완료", color: "#6d8ba1" },
    PREPARING: { label: "제조 중", color: "#c8956d" },
    READY: { label: "픽업 대기", color: "#6b8e5a" },
    COMPLETED: { label: "완료", color: "#8a7a6d" },
  };
  const ORDER_TYPE_LABEL = { DINE_IN: "매장식사", TAKEOUT: "포장" };

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

  function renderOrderStatusBreakdown(orders) {
    const el = document.getElementById("order-status-breakdown");
    el.innerHTML = ACTIVE_ORDER_STATUSES.map((status) => {
      const count = orders.filter((o) => o.status === status).length;
      return `
        <div class="status-pill">
          <span class="status-pill__dot" style="background:${STATUS_META[status].color}"></span>
          <span class="status-pill__label">${STATUS_META[status].label}</span>
          <span class="status-pill__count">${count}건</span>
        </div>`;
    }).join("");
  }

  function renderRecentOrders(orders) {
    const el = document.getElementById("recent-orders");
    const recent = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    el.innerHTML = recent.length
      ? recent
          .map((order) => {
            const status = STATUS_META[order.status] || { label: order.status, color: "#8a7a6d" };
            const itemsText = order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ");
            return `
        <li class="dash-list-item">
          <a href="/admin/orders/detail?id=${order.id}" class="dash-list-item__main">
            <p class="dash-list-item__title">#${order.id} · ${order.user.name}님 <span class="badge">${ORDER_TYPE_LABEL[order.orderType] || "포장"}</span></p>
            <p class="dash-list-item__meta">${itemsText}</p>
          </a>
          <span class="dash-list-item__side" style="color:${status.color}">${status.label}</span>
        </li>`;
          })
          .join("")
      : `<li class="dash-empty">최근 주문이 없습니다.</li>`;
  }

  function renderRecentQuestions(questions) {
    const el = document.getElementById("recent-questions");
    const waiting = questions
      .filter((q) => !q.answer)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    el.innerHTML = waiting.length
      ? waiting
          .map(
            (q) => `
        <li class="dash-list-item">
          <a href="/admin/qna/detail?id=${q.id}" class="dash-list-item__main">
            <p class="dash-list-item__title">${q.title}</p>
            <p class="dash-list-item__meta">${q.user.name} · ${formatDateTime(q.createdAt)}</p>
          </a>
          <span class="dash-list-item__side badge badge-soldout">답변 대기</span>
        </li>`
          )
          .join("")
      : `<li class="dash-empty">미답변 문의가 없습니다.</li>`;
  }

  function renderTopMenus(topMenus) {
    const el = document.getElementById("top-menu-list");
    el.innerHTML = topMenus.length
      ? topMenus
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
  }

  function renderCategoryBreakdown(categoryBreakdown) {
    const el = document.getElementById("category-breakdown");
    const maxRevenue = Math.max(1, ...categoryBreakdown.map((c) => c.revenue));
    el.innerHTML = categoryBreakdown.length
      ? categoryBreakdown
          .map(
            (c) => `
        <li class="category-row">
          <span class="category-row__name">${c.name}</span>
          <div class="category-row__bar-track">
            <div class="category-row__bar-fill" style="width:${Math.round((c.revenue / maxRevenue) * 100)}%"></div>
          </div>
          <span class="category-row__revenue">${c.revenue.toLocaleString("ko-KR")}원</span>
          <span class="category-row__count">${c.count}개</span>
        </li>`
          )
          .join("")
      : `<li class="category-row">최근 7일간 판매 데이터가 없습니다.</li>`;
  }

  function renderSoldOutMenus(menuItems) {
    const sectionEl = document.getElementById("soldout-section");
    const listEl = document.getElementById("soldout-list");
    const soldOut = menuItems.filter((m) => m.isSoldOut);

    sectionEl.hidden = soldOut.length === 0;
    listEl.innerHTML = soldOut
      .map((m) => `<a class="badge badge-soldout" href="/admin/menus/edit?id=${m.id}">${m.name}</a>`)
      .join("");
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

    renderOrderStatusBreakdown(orders);
    renderRecentOrders(orders);
    renderRecentQuestions(questions);
    renderTopMenus(stats.topMenus);
    renderCategoryBreakdown(stats.categoryBreakdown);
    renderSoldOutMenus(menuItems);

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
