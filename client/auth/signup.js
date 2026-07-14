/* ============================================
   고객 - 회원가입
   ============================================ */

const form = document.getElementById("signup-form");
const submitBtn = form.querySelector(".auth-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  if (data.get("password") !== data.get("passwordConfirm")) {
    showToast("비밀번호가 일치하지 않습니다.");
    return;
  }

  submitBtn.disabled = true;
  try {
    const result = await api.post("/auth/signup", {
      username: data.get("username"),
      password: data.get("password"),
      name: data.get("name"),
      phone: data.get("phone") || undefined,
    });
    saveAuth(result);
    showToast(`${result.user.name}님, 가입을 환영합니다!`);
    window.location.href = "/my";
  } catch (err) {
    showToast(err.message || "회원가입에 실패했습니다.");
  } finally {
    submitBtn.disabled = false;
  }
});
