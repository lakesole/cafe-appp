/* ============================================
   관리자 - 종업원 관리 (실제 API 연동: /api/admin/staff)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

async function renderStaff() {
  const staffList = await api.get("/admin/staff");
  const tbody = document.getElementById("staff-table-body");
  tbody.innerHTML = staffList.map(
    (s) => `
    <tr>
      <td>${s.id}</td>
      <td>${s.name}</td>
      <td>${s.email}</td>
      <td><span class="role-badge ${s.role === "ADMIN" ? "is-admin" : ""}">${s.role}</span></td>
      <td>${new Date(s.createdAt).toLocaleDateString("ko-KR")}</td>
      <td class="row-actions">
        <a href="/admin/staff/edit?id=${s.id}">수정</a>
        <button data-id="${s.id}" class="delete-btn">삭제</button>
      </td>
    </tr>`
  ).join("");

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("이 종업원 계정을 삭제할까요?")) return;
      await api.delete(`/admin/staff/${btn.dataset.id}`);
      renderStaff();
    });
  });
}

renderStaff();

}
