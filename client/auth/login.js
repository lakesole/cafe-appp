/* ============================================
   고객 - 로그인
   ============================================ */

document.getElementById("cart-count").textContent = getCartCount();

const form = document.getElementById("login-form");
const submitBtn = form.querySelector(".auth-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  submitBtn.disabled = true;
  try {
    const result = await api.post("/auth/login", {
      email: data.get("email"),
      password: data.get("password"),
    });
    saveAuth(result);
    showToast(`${result.user.name}님, 환영합니다!`);

    const roleHome = { STAFF: "/staff/list", ADMIN: "/admin" };
    window.location.href = roleHome[result.user.role] || "/my";
  } catch (err) {
    showToast(err.message || "로그인에 실패했습니다.");
  } finally {
    submitBtn.disabled = false;
  }
});
