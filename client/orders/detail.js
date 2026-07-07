/* ============================================
   고객 - 주문 상세
   ============================================ */

const { ORDERS, ORDER_STATUS_META } = window.SAMPLE_DATA;

document.getElementById("cart-count").textContent = getCartCount();

const detailEl = document.getElementById("detail");
const orderId = Number(new URLSearchParams(location.search).get("id"));
const order = ORDERS.find((o) => o.id === orderId);

const TIMELINE_STEPS = ["PENDING", "PAID", "PREPARING", "READY", "COMPLETED"];

if (!order) {
  detailEl.innerHTML = `
    <p class="not-found">
      존재하지 않는 주문입니다.<br />
      <a href="list" class="back-link">주문 내역으로 돌아가기</a>
    </p>`;
} else {
  const status = ORDER_STATUS_META[order.status];
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);

  const timelineHtml =
    order.status === "CANCELED"
      ? `<p class="order-status" style="color:${status.color}">주문이 취소되었습니다.</p>`
      : `<div class="status-timeline">
          ${TIMELINE_STEPS.map(
            (step, i) => `
            <span class="status-step ${i <= currentStepIndex ? "is-done" : ""}">
              ${ORDER_STATUS_META[step].label}
            </span>`
          ).join("")}
        </div>`;

  detailEl.innerHTML = `
    <div class="order-detail__top">
      <h1 class="order-detail__id">주문 #${order.id}</h1>
      <span class="order-status" style="color:${status.color}">${status.label}</span>
    </div>
    <p class="order-detail__meta">
      주문일시 ${formatDateTime(order.createdAt)} · 픽업 예정 ${formatDateTime(order.pickupTime)}
    </p>

    <div class="order-detail__items">
      ${order.items
        .map(
          (it) => `
        <div class="order-detail__item">
          <span>
            ${it.name} × ${it.quantity}
            ${it.selectedOptions.length ? `<br /><span class="order-detail__item-meta">${it.selectedOptions.join(", ")}</span>` : ""}
          </span>
          <span>${formatPrice(it.unitPrice * it.quantity)}</span>
        </div>`
        )
        .join("")}
    </div>

    <div class="order-detail__total">
      <span>총 결제 금액</span>
      <span>${formatPrice(order.totalPrice)}</span>
    </div>

    ${timelineHtml}
  `;
}
