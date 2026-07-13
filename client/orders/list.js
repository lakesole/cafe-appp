/* ============================================
   고객 - 주문 내역 목록 (실제 API 연동: GET /api/orders/me)
   ============================================ */

if (!isLoggedIn()) {
  window.location.href = "/auth/login";
} else {
  const { ORDER_STATUS_META } = window.SAMPLE_DATA;
  const ORDER_TYPE_LABEL = { DINE_IN: "매장식사", TAKEOUT: "포장" };

  document.getElementById("cart-count").textContent = getCartCount();

  const orderListEl = document.getElementById("order-list");

  async function init() {
    const orders = await api.get("/orders/me");

    orderListEl.innerHTML = orders
      .map((order) => {
        const status = ORDER_STATUS_META[order.status];
        const itemsText = order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ");
        return `
        <a class="order-card" href="detail?id=${order.id}">
          <div class="order-card__top">
            <span class="order-card__id">주문 #${order.id}</span>
            <span class="order-status" style="color:${status.color}">${status.label}</span>
          </div>
          <p class="order-card__items">
            <span class="order-type-tag">${ORDER_TYPE_LABEL[order.orderType] || "포장"}</span>
            ${itemsText}
          </p>
          <div class="order-card__bottom">
            <span>${formatDateTime(order.createdAt)}</span>
            <span class="order-card__total">${formatPrice(order.totalPrice)}</span>
          </div>
        </a>`;
      })
      .join("");
  }

  init();
}
