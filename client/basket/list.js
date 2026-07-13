/* ============================================
   고객 - 장바구니
   ============================================ */

const basketListEl = document.getElementById("basket-list");
const basketLayoutEl = document.querySelector(".basket-layout");
const emptyEl = document.getElementById("empty");
const summaryCountEl = document.getElementById("summary-count");
const summaryTotalEl = document.getElementById("summary-total");
const cartCountEl = document.getElementById("cart-count");

function render() {
  const cart = getCart();
  cartCountEl.textContent = getCartCount();

  basketLayoutEl.hidden = cart.length === 0;
  emptyEl.hidden = cart.length > 0;

  basketListEl.innerHTML = cart
    .map((item) => {
      const optionsText = (item.selectedOptions || []).map((o) => o.choiceName).join(", ");
      return `
      <li class="basket-item" data-cart-item-id="${item.cartItemId}">
        <div class="basket-item__thumb">
          ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" />` : ""}
        </div>
        <div class="basket-item__info">
          <p class="basket-item__name">${item.name}</p>
          ${optionsText ? `<p class="basket-item__options">${optionsText}</p>` : ""}
          <p class="basket-item__price">${formatPrice(item.unitPrice * item.quantity)}</p>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn js-qty-minus">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button type="button" class="qty-btn js-qty-plus">+</button>
        </div>
        <button type="button" class="remove-btn js-remove">삭제</button>
      </li>`;
    })
    .join("");

  summaryCountEl.textContent = `${getCartCount()}개`;
  summaryTotalEl.textContent = formatPrice(getCartTotal());
}

basketListEl.addEventListener("click", (e) => {
  const li = e.target.closest("[data-cart-item-id]");
  if (!li) return;
  const cartItemId = li.dataset.cartItemId;
  const cart = getCart();
  const item = cart.find((c) => c.cartItemId === cartItemId);
  if (!item) return;

  if (e.target.closest(".js-qty-plus")) {
    updateCartQty(cartItemId, item.quantity + 1);
    render();
  } else if (e.target.closest(".js-qty-minus")) {
    updateCartQty(cartItemId, item.quantity - 1);
    render();
  } else if (e.target.closest(".js-remove")) {
    removeFromCart(cartItemId);
    render();
  }
});

document.getElementById("btn-checkout").addEventListener("click", () => {
  if (getCart().length === 0) return;
  window.location.href = "/checkout";
});

render();
