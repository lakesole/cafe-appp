/* ============================================
   관리자 - 주문 상세 / 상태 변경 (실제 API 연동)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {
  const { ORDER_STATUS_META } = window.SAMPLE_DATA;
  const ORDER_TYPE_LABEL = { DINE_IN: "매장식사", TAKEOUT: "포장" };
  const QUEUE_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"];

  const detailEl = document.getElementById("detail");
  const orderId = Number(new URLSearchParams(location.search).get("id"));

  function renderNotFound() {
    detailEl.innerHTML = `
      <p class="not-found">
        존재하지 않는 주문입니다.<br />
        <a href="list" class="back-link">주문 관리로 돌아가기</a>
      </p>`;
  }

  function renderOrder(order) {
    const status = ORDER_STATUS_META[order.status];

    detailEl.innerHTML = `
      <div class="order-detail-card__top">
        <h1 class="order-detail-card__id">주문 #${order.id} · ${order.user.name}님</h1>
        <span class="order-detail-card__status" style="color:${status.color}">${status.label}</span>
      </div>
      <p class="order-detail-card__meta">
        <span class="badge">${ORDER_TYPE_LABEL[order.orderType] || "포장"}</span>
        주문일시 ${formatDateTime(order.createdAt)} ${order.pickupTime ? `· 픽업 예정 ${formatDateTime(order.pickupTime)}` : ""}
      </p>

      <div class="order-detail-card__items">
        ${order.items
          .map((it) => {
            const optionsText = (it.selectedOptions || []).map((o) => o.choiceName).join(", ");
            return `
            <div class="order-detail-card__item">
              <span>${it.name} × ${it.quantity} ${optionsText ? `(${optionsText})` : ""}</span>
              <span>${formatPrice(it.unitPrice * it.quantity)}</span>
            </div>`;
          })
          .join("")}
      </div>

      <p class="order-detail-card__total"><strong>총 금액</strong> ${formatPrice(order.totalPrice)}</p>

      <p class="status-actions__label">주문 상태 변경</p>
      <div class="status-actions" id="status-actions">
        ${QUEUE_STATUSES.map(
          (s) => `<button type="button" data-status="${s}" class="${order.status === s ? "active" : ""}">${ORDER_STATUS_META[s].label}</button>`
        ).join("")}
      </div>
    `;

    document.getElementById("status-actions").addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      try {
        const updated = await api.patch(`/staff/orders/${order.id}/status`, { status: btn.dataset.status });
        showToast(`상태를 "${ORDER_STATUS_META[updated.status].label}"(으)로 변경했어요.`);
        renderOrder(updated);
      } catch (err) {
        showToast(err.message || "상태 변경에 실패했습니다.");
      }
    });
  }

  async function init() {
    try {
      const order = await api.get(`/staff/orders/${orderId}`);
      renderOrder(order);
    } catch {
      renderNotFound();
    }
  }

  init();
}
