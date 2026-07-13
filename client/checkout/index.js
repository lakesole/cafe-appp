/* ============================================
   고객 - 주문서 작성 / 결제 (실제 API 연동: POST /api/orders, /api/payments/mock)
   ============================================ */

if (!isLoggedIn()) {
  window.location.href = "/auth/login";
} else {
  const orderItemsEl = document.getElementById("order-items");
  const checkoutLayoutEl = document.querySelector(".checkout-layout");
  const emptyEl = document.getElementById("empty");
  const summaryCountEl = document.getElementById("summary-count");
  const summaryTotalEl = document.getElementById("summary-total");
  const cartCountEl = document.getElementById("cart-count");
  const payBtn = document.getElementById("btn-pay");
  const seatBadgeEl = document.getElementById("checkout-seat-badge");

  async function loadSeatStatus() {
    try {
      const { seatStatus } = await api.get("/store-status");
      const isFull = seatStatus === "FULL";
      seatBadgeEl.textContent = isFull ? "매장 만석" : "매장 좌석 가능";
      seatBadgeEl.classList.toggle("seat-badge--full", isFull);
      seatBadgeEl.hidden = false;
    } catch {
      seatBadgeEl.hidden = true;
    }
  }

  function render() {
    const cart = getCart();
    cartCountEl.textContent = getCartCount();

    checkoutLayoutEl.hidden = cart.length === 0;
    emptyEl.hidden = cart.length > 0;

    orderItemsEl.innerHTML = cart
      .map((item) => {
        const optionsText = (item.selectedOptions || []).map((o) => o.choiceName).join(", ");
        return `
        <li class="order-item">
          <span>
            ${item.name} × ${item.quantity}
            ${optionsText ? `<br /><span class="order-item__meta">${optionsText}</span>` : ""}
          </span>
          <span>${formatPrice(item.unitPrice * item.quantity)}</span>
        </li>`;
      })
      .join("");

    summaryCountEl.textContent = `${getCartCount()}개`;
    summaryTotalEl.textContent = formatPrice(getCartTotal());
  }

  payBtn.addEventListener("click", async () => {
    const cart = getCart();
    if (cart.length === 0) return;

    const pickupMinutes = Number(document.getElementById("pickup-time").value);
    const pickupTime = new Date(Date.now() + pickupMinutes * 60000).toISOString();
    const method = document.querySelector('input[name="pay-method"]:checked').value;
    const orderType = document.querySelector('input[name="order-type"]:checked').value;

    const items = cart.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      optionChoiceIds: (item.selectedOptions || [])
        .map((o) => o.optionChoiceId)
        .filter((id) => id != null),
    }));

    payBtn.disabled = true;
    try {
      const order = await api.post("/orders", { items, pickupTime, orderType });
      await api.post("/payments/mock", { orderId: order.id, method });
      clearCart();
      showToast("주문이 완료되었어요! 픽업 시간에 맞춰 준비할게요 ☕");
      window.location.href = "/orders/list";
    } catch (err) {
      showToast(err.message || "주문에 실패했습니다.");
      payBtn.disabled = false;
    }
  });

  render();
  loadSeatStatus();
}
