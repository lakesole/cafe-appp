/* ============================================
   고객 - 회원가입 (화면만, API 연동은 6단계에서 진행)
   ============================================ */

document.getElementById("cart-count").textContent = getCartCount();

document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  if (form.password.value !== form.passwordConfirm.value) {
    showToast("비밀번호가 일치하지 않습니다.");
    return;
  }
  showToast("회원가입 기능은 서버 연동 단계에서 제공됩니다.");
});
