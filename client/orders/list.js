/* ============================================
   고객 - 주문 내역 목록
   ============================================ */

const { ORDERS, ORDER_STATUS_META } = window.SAMPLE_DATA;

document.getElementById("cart-count").textContent = getCartCount();

document.getElementById("order-list").innerHTML = ORDERS.map((order) => {
  const status = ORDER_STATUS_META[order.status];
  const itemsText = order.items.map((it) => `${it.name} ×${it.quantity}`).join(", ");
  return `
    <a class="order-card" href="detail?id=${order.id}">
      <div class="order-card__top">
        <span class="order-card__id">주문 #${order.id}</span>
        <span class="order-status" style="color:${status.color}">${status.label}</span>
      </div>
      <p class="order-card__items">${itemsText}</p>
      <div class="order-card__bottom">
        <span>${formatDateTime(order.createdAt)}</span>
        <span class="order-card__total">${formatPrice(order.totalPrice)}</span>
      </div>
    </a>`;
}).join("");
