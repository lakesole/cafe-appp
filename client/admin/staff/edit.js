/* ============================================
   관리자 - 종업원 수정 (실제 API 연동: PUT /api/admin/staff/:id)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const staffId = Number(new URLSearchParams(location.search).get("id"));
const form = document.getElementById("staff-form");

async function loadStaff() {
  try {
    const staff = await api.get(`/admin/staff/${staffId}`);
    form.name.value = staff.name;
    form.email.value = staff.email;
    form.role.value = staff.role;
  } catch {
    showToast("종업원 정보를 불러오지 못했습니다.");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  try {
    await api.put(`/admin/staff/${staffId}`, {
      name: data.get("name"),
      email: data.get("email"),
      role: data.get("role"),
    });
    location.href = "/admin/staff/list";
  } catch (err) {
    showToast(err.message || "수정에 실패했습니다.");
  }
});

loadStaff();

}
