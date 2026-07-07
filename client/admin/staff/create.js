/* ============================================
   관리자 - 종업원 등록 (샘플 데이터, 화면 인터랙션만)
   ============================================ */

document.getElementById("staff-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const staffList = getStaffList();
  const nextId = staffList.reduce((max, s) => Math.max(max, s.id), 0) + 1;

  staffList.push({
    id: nextId,
    name: data.get("name"),
    email: data.get("email"),
    role: data.get("role"),
    createdAt: new Date().toISOString().slice(0, 10),
  });
  saveStaffList(staffList);

  location.href = "/admin/staff/list";
});
