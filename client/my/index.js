/* ============================================
   고객 - 마이페이지
   ============================================ */

if (!isLoggedIn()) {
  window.location.href = "/auth/login";
} else {
  const { ORDER_STATUS_META } = window.SAMPLE_DATA;

  document.getElementById("cart-count").textContent = getCartCount();

  const currentUser = getCurrentUser();
  document.getElementById("profile-name").textContent = currentUser.name;
  document.getElementById("profile-email").textContent = currentUser.email;

  document.getElementById("btn-logout").addEventListener("click", () => {
    logout();
  });

  async function loadRecentOrders() {
    const orders = await api.get("/orders/me");
    document.getElementById("recent-orders").innerHTML = orders
      .slice(0, 3)
      .map((order) => {
        const status = ORDER_STATUS_META[order.status];
        return `
          <a class="recent-order" href="/orders/detail?id=${order.id}">
            <span>주문 #${order.id} · ${formatDateTime(order.createdAt)}</span>
            <span class="recent-order__status" style="color:${status.color}">${status.label}</span>
          </a>`;
      })
      .join("");
  }

  loadRecentOrders();
}
