/* ============================================
   관리자 - 종업원 등록 (실제 API 연동: POST /api/admin/staff)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

document.getElementById("staff-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(e.target);

  try {
    await api.post("/admin/staff", {
      name: data.get("name"),
      username: data.get("username"),
      password: data.get("password"),
      role: data.get("role"),
    });
    location.href = "/admin/staff/list";
  } catch (err) {
    showToast(err.message || "종업원 등록에 실패했습니다.");
  }
});

}
