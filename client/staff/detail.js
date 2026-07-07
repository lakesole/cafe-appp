/* ============================================
   종업원 - 주문 상세 / 상태 변경 (화면 인터랙션만, 새로고침 시 초기화)
   ============================================ */

const { ORDERS, ORDER_STATUS_META } = window.SAMPLE_DATA;
const STAFF_STATUSES = ["PAID", "PREPARING", "READY", "COMPLETED"];

const detailEl = document.getElementById("detail");
const orderId = Number(new URLSearchParams(location.search).get("id"));
const order = ORDERS.find((o) => o.id === orderId);

function render() {
  if (!order) {
    detailEl.innerHTML = `
      <p class="not-found">
        존재하지 않는 주문입니다.<br />
        <a href="list" class="back-link">주문 큐로 돌아가기</a>
      </p>`;
    return;
  }

  const status = ORDER_STATUS_META[order.status];

  detailEl.innerHTML = `
    <div class="staff-order-detail__top">
      <h1 class="staff-order-detail__id">주문 #${order.id}</h1>
      <span style="color:${status.color}; font-weight:700;">${status.label}</span>
    </div>
    <p>주문일시 ${formatDateTime(order.createdAt)} · 픽업 예정 ${formatDateTime(order.pickupTime)}</p>

    <div class="staff-order-detail__items">
      ${order.items
        .map(
          (it) => `
        <div>
          ${it.name} × ${it.quantity} ${it.selectedOptions.length ? `(${it.selectedOptions.join(", ")})` : ""}
          — ${formatPrice(it.unitPrice * it.quantity)}
        </div>`
        )
        .join("")}
    </div>

    <p><strong>총 금액</strong> ${formatPrice(order.totalPrice)}</p>

    <div class="status-actions" id="status-actions">
      ${STAFF_STATUSES.map(
        (s) => `<button type="button" data-status="${s}" class="${order.status === s ? "active" : ""}">${ORDER_STATUS_META[s].label}</button>`
      ).join("")}
    </div>
  `;

  document.getElementById("status-actions").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    order.status = btn.dataset.status;
    showToast(`상태를 "${ORDER_STATUS_META[order.status].label}"(으)로 변경했어요.`);
    render();
  });
}

render();
