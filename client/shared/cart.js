/* ============================================
   장바구니 (localStorage 기반, 서버 불필요)
   ============================================ */

const CART_KEY = "cafeorder_cart";

function formatPrice(value) {
  return `${Number(value).toLocaleString("ko-KR")}원`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function showToast(message, duration = 2000) {
  let toast = document.getElementById("cafeorder-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "cafeorder-toast";
    toast.style.cssText = `
      position: fixed; left: 50%; bottom: 32px; transform: translateX(-50%) translateY(20px);
      background: #4a2f1c; color: #fff; padding: 12px 20px; border-radius: 999px;
      font-weight: 600; box-shadow: 0 6px 20px rgba(0,0,0,.2);
      opacity: 0; transition: opacity .25s, transform .25s; z-index: 9999; pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-50%) translateY(20px)";
  }, duration);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/** 선택된 옵션 조합을 비교용 키로 변환 */
function optionsSignature(selectedOptions) {
  return (selectedOptions || [])
    .map((o) => o.choiceName)
    .sort()
    .join("|");
}

/**
 * 장바구니에 담기
 * item: { menuItemId, name, unitPrice, quantity, selectedOptions: [{groupName, choiceName, extraPrice}] }
 * 같은 메뉴 + 같은 옵션 조합이면 수량만 합산
 */
function addToCart(item) {
  const cart = getCart();
  const signature = optionsSignature(item.selectedOptions);
  const existing = cart.find(
    (c) => c.menuItemId === item.menuItemId && optionsSignature(c.selectedOptions) === signature
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push({
      cartItemId: `${item.menuItemId}-${Date.now()}`,
      menuItemId: item.menuItemId,
      name: item.name,
      imageUrl: item.imageUrl || "",
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions || [],
    });
  }

  saveCart(cart);
  return cart;
}

function updateCartQty(cartItemId, quantity) {
  let cart = getCart();
  if (quantity <= 0) {
    cart = cart.filter((c) => c.cartItemId !== cartItemId);
  } else {
    const found = cart.find((c) => c.cartItemId === cartItemId);
    if (found) found.quantity = quantity;
  }
  saveCart(cart);
  return cart;
}

function removeFromCart(cartItemId) {
  const cart = getCart().filter((c) => c.cartItemId !== cartItemId);
  saveCart(cart);
  return cart;
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce((sum, c) => sum + c.quantity, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, c) => sum + c.unitPrice * c.quantity, 0);
}

const footerYearEl = document.getElementById("footer-year");
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
