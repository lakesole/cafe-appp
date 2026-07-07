if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

async function loadMenuItems() {
  const menuItems = await api.get("/admin/menu-items");
  const tbody = document.getElementById("menu-table-body");
  tbody.innerHTML = menuItems
    .map(
      (m) => `
    <tr>
      <td>${m.id}</td>
      <td>${m.name}</td>
      <td>${m.category ? m.category.name : "-"}</td>
      <td>${m.price.toLocaleString()}원</td>
      <td>${m.isSoldOut ? "품절" : "-"}</td>
      <td class="row-actions">
        <a href="/admin/menus/edit?id=${m.id}">수정</a>
        <button data-id="${m.id}" class="delete-btn">삭제</button>
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("이 메뉴를 삭제할까요?")) return;
      await api.delete(`/admin/menu-items/${btn.dataset.id}`);
      loadMenuItems();
    });
  });
}

loadMenuItems();

}
