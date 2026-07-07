if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

async function loadCategories() {
  const categories = await api.get("/admin/categories");
  const tbody = document.getElementById("category-table-body");
  tbody.innerHTML = categories
    .map(
      (c) => `
    <tr>
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.sortOrder}</td>
      <td class="row-actions">
        <a href="/admin/categories/edit?id=${c.id}">수정</a>
        <button data-id="${c.id}" class="delete-btn">삭제</button>
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("이 카테고리를 삭제할까요?")) return;
      await api.delete(`/admin/categories/${btn.dataset.id}`);
      loadCategories();
    });
  });
}

loadCategories();

}
