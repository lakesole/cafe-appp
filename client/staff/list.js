/* ============================================
   종업원 - 주문 큐 (실제 API 연동: GET /api/staff/orders)
   ============================================ */

if (!isLoggedIn() || !["STAFF", "ADMIN"].includes(getCurrentUser().role)) {
  window.location.href = "/auth/login";
} else {
  const { ORDER_STATUS_META } = window.SAMPLE_DATA;
  const ORDER_TYPE_LABEL = { DINE_IN: "매장식사", TAKEOUT: "포장" };

  const STAFF_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"];

  const statusTabsEl = document.getElementById("status-tabs");
  const orderQueueEl = document.getElementById("order-queue");

  let activeStatus = "all";

  function renderTabs() {
    const tabs = [{ id: "all", label: "전체" }, ...STAFF_STATUSES.map((s) => ({ id: s, label: ORDER_STATUS_META[s].label }))];
    statusTabsEl.innerHTML = tabs
      .map(
        (tab) => `
        <button type="button" class="status-tab ${tab.id === activeStatus ? "active" : ""}" data-id="${tab.id}">
          ${tab.label}
        </button>`
      )
      .join("");
  }

  async function renderQueue() {
    const query = activeStatus === "all" ? "" : `?status=${activeStatus}`;
    const orders = await api.get(`/staff/orders${query}`);

    orderQueueEl.innerHTML = orders
      .map((order) => {
        const status = ORDER_STATUS_META[order.status];
        const itemsText = order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ");
        return `
        <li class="queue-card">
          <a href="detail?id=${order.id}">
            <span class="queue-card__id">주문 #${order.id} · ${order.user.name}님</span>
            <p class="queue-card__items">
              <span class="badge">${ORDER_TYPE_LABEL[order.orderType] || "포장"}</span>
              ${itemsText}
            </p>
          </a>
          <span class="queue-card__status" style="color:${status.color}">${status.label}</span>
        </li>`;
      })
      .join("");
  }

  statusTabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    activeStatus = btn.dataset.id;
    renderTabs();
    renderQueue();
  });

  renderTabs();
  renderQueue();

  /* 실시간 신규 주문 알림 (Socket.IO) */
  const socket = io({ auth: { token: getAccessToken() } });
  socket.on("order:new", (order) => {
    showToast(`🔔 새 주문이 들어왔어요! 주문 #${order.id} · ${order.user.name}님`);
    renderQueue();
  });
}
