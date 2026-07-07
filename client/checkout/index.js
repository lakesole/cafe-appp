/* ============================================
   고객 - 주문서 작성 / 결제 (모의 결제, 화면 전환만)
   ============================================ */

const orderItemsEl = document.getElementById("order-items");
const checkoutLayoutEl = document.querySelector(".checkout-layout");
const emptyEl = document.getElementById("empty");
const summaryCountEl = document.getElementById("summary-count");
const summaryTotalEl = document.getElementById("summary-total");
const cartCountEl = document.getElementById("cart-count");

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

document.getElementById("btn-pay").addEventListener("click", () => {
  if (getCart().length === 0) return;
  clearCart();
  showToast("주문이 완료되었어요! 픽업 시간에 맞춰 준비할게요 ☕");
  window.location.href = "/orders/list";
});

render();
