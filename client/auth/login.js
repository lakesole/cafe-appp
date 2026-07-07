/* ============================================
   고객 - 로그인 (화면만, API 연동은 6단계에서 진행)
   ============================================ */

document.getElementById("cart-count").textContent = getCartCount();

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("로그인 기능은 서버 연동 단계에서 제공됩니다.");
});
