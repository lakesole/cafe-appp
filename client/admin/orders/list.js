/* ============================================
   관리자 - 주문 관리 (실제 API 연동: GET /api/staff/orders)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {
  const { ORDER_STATUS_META } = window.SAMPLE_DATA;
  const ORDER_TYPE_LABEL = { DINE_IN: "매장식사", TAKEOUT: "포장" };

  const QUEUE_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"];

  const statusTabsEl = document.getElementById("status-tabs");
  const orderQueueEl = document.getElementById("order-queue");
  const emptyEl = document.getElementById("empty");

  let activeStatus = "PAID";

  function renderTabs() {
    const tabs = [...QUEUE_STATUSES.map((s) => ({ id: s, label: ORDER_STATUS_META[s].label })), { id: "all", label: "전체" }];
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

    emptyEl.hidden = orders.length > 0;
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

  /* 실시간 신규 주문 알림 (Socket.IO)
     auth를 콜백으로 넘겨 재연결 시마다 최신 토큰을 읽는다. 만료로 연결이
     거부되면(connect_error) 토큰을 갱신한 뒤 직접 재접속한다 — socket.io는
     인증 실패로 거부된 연결을 자동으로 재시도하지 않는다. */
  const socket = io({ auth: (cb) => cb({ token: getAccessToken() }) });
  socket.on("connect_error", async () => {
    if (typeof refreshAccessToken !== "function") return;
    const newToken = await refreshAccessToken();
    if (newToken) socket.connect();
  });
  socket.on("order:new", (order) => {
    showToast(`🔔 새 주문이 들어왔어요! 주문 #${order.id} · ${order.user.name}님`);
    renderQueue();
  });
}
