/* ============================================
   관리자 - 종업원 관리 (샘플 데이터, 화면 인터랙션만)
   ============================================ */

function renderStaff() {
  const staffList = getStaffList();
  const tbody = document.getElementById("staff-table-body");
  tbody.innerHTML = staffList.map(
    (s) => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td><span class="role-badge ${s.role === "ADMIN" ? "is-admin" : ""}">${s.role}</span></td>
      <td>${s.createdAt}</td>
      <td class="row-actions">
        <a href="/admin/staff/edit?id=${s.id}">수정</a>
        <button data-id="${s.id}" class="delete-btn">삭제</button>
      </td>
    </tr>`
  ).join("");

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("이 종업원 계정을 삭제할까요?")) return;
      const staffList = getStaffList().filter((s) => s.id !== Number(btn.dataset.id));
      saveStaffList(staffList);
      renderStaff();
    });
  });
}

renderStaff();
