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
      <td>
        <div class="menu-thumb">
          ${m.imageUrl ? `<img src="${m.imageUrl}" alt="${m.name}" />` : ""}
        </div>
      </td>
      <td><span class="menu-table__name">${m.name}</span></td>
      <td>${m.category ? `<span class="menu-table__category">${m.category.name}</span>` : "-"}</td>
      <td>${m.price.toLocaleString()}원</td>
      <td>
        <span class="badge ${m.isSoldOut ? "badge-soldout" : "badge-ok"}">${m.isSoldOut ? "품절" : "판매중"}</span>
      </td>
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
