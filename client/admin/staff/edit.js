/* ============================================
   관리자 - 종업원 수정 (샘플 데이터, 화면 인터랙션만)
   ============================================ */

const staffId = Number(new URLSearchParams(location.search).get("id"));
const form = document.getElementById("staff-form");
const staffList = getStaffList();
const staff = staffList.find((s) => s.id === staffId);

if (staff) {
  form.name.value = staff.name;
  form.email.value = staff.email;
  form.role.value = staff.role;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!staff) return;
  const data = new FormData(form);
  staff.name = data.get("name");
  staff.email = data.get("email");
  staff.role = data.get("role");
  saveStaffList(staffList);
  location.href = "/admin/staff/list";
});
