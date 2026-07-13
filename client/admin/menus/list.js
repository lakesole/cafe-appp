if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const categoryFilterEl = document.getElementById("category-filter");
const tbody = document.getElementById("menu-table-body");
const emptyEl = document.getElementById("empty");

let CATEGORIES = [];
let MENU_ITEMS = [];
let activeCategory = "all";

function renderCategoryFilter() {
  const options = [{ id: "all", name: "전체" }, ...CATEGORIES];
  categoryFilterEl.innerHTML = options
    .map(
      (c) => `
      <button type="button" class="category-filter__item ${c.id === activeCategory ? "is-active" : ""}" data-id="${c.id}">
        ${c.name}
      </button>`
    )
    .join("");
}

function renderTable() {
  const items =
    activeCategory === "all" ? MENU_ITEMS : MENU_ITEMS.filter((m) => m.categoryId === activeCategory);

  emptyEl.hidden = items.length > 0;
  tbody.innerHTML = items
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
      <td>
        <div class="row-actions">
          <a href="/admin/menus/edit?id=${m.id}">수정</a>
          <button data-id="${m.id}" class="delete-btn">삭제</button>
        </div>
      </td>
    </tr>`
    )
    .join("");

  tbody.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("이 메뉴를 삭제할까요?")) return;
      await api.delete(`/admin/menu-items/${btn.dataset.id}`);
      await loadMenuItems();
    });
  });
}

async function loadMenuItems() {
  MENU_ITEMS = await api.get("/admin/menu-items");
  renderTable();
}

categoryFilterEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn) return;
  activeCategory = btn.dataset.id === "all" ? "all" : Number(btn.dataset.id);
  renderCategoryFilter();
  renderTable();
});

async function init() {
  CATEGORIES = await api.get("/admin/categories");
  renderCategoryFilter();
  await loadMenuItems();
}

init();

}
