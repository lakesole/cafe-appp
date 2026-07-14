if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const categoryFilterEl = document.getElementById("category-filter");
const tbody = document.getElementById("menu-table-body");
const emptyEl = document.getElementById("empty");

let CATEGORIES = [];
let MENU_ITEMS = [];
let activeCategory = "all";

const CATEGORY_ICONS = {
  전체: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M4 10h16"/></svg>',
  커피: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h13a3 3 0 0 1 0 6h-1"/><path d="M4 8v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8"/><path d="M8 4c0 1-1 1-1 2M12 4c0 1-1 1-1 2"/></svg>',
  라떼: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h13a3 3 0 0 1 0 6h-1"/><path d="M4 8v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8"/><path d="M9 8c-1.5-1.5-1-3 0-4"/></svg>',
  티: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9Z"/><path d="M9 13c0 1.5 1 2.5 2 3"/></svg>',
  에이드: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v6M9 5l3 3 3-3"/><circle cx="12" cy="15" r="7"/></svg>',
  스무디: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12l-2 12a4 4 0 0 1-4 3.5A4 4 0 0 1 8 15L6 3Z"/><path d="M6.6 8h10.8"/><path d="M12 18.5V21"/></svg>',
  디저트: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="14" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="13.5" r="1" fill="currentColor" stroke="none"/></svg>',
};

const FALLBACK_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/></svg>';

function renderCategoryFilter() {
  const options = [{ id: "all", name: "전체" }, ...CATEGORIES];
  categoryFilterEl.innerHTML = options
    .map((c) => {
      const count = c.id === "all" ? MENU_ITEMS.length : MENU_ITEMS.filter((m) => m.categoryId === c.id).length;
      const icon = CATEGORY_ICONS[c.name] || FALLBACK_ICON;
      return `
      <button type="button" class="category-filter__item ${c.id === activeCategory ? "is-active" : ""}" data-id="${c.id}">
        <span class="category-filter__icon">${icon}</span>
        <span class="category-filter__name">${c.name}</span>
        <span class="category-filter__count">${count}</span>
      </button>`;
    })
    .join("");
}

function renderTable() {
  const items =
    activeCategory === "all" ? MENU_ITEMS : MENU_ITEMS.filter((m) => m.categoryId === activeCategory);

  emptyEl.hidden = items.length > 0;
  tbody.innerHTML = items
    .map(
      (m) => `
    <tr data-id="${m.id}">
      <td>
        <div class="menu-thumb">
          ${m.imageUrl ? `<img src="${m.imageUrl}" alt="${m.name}" loading="lazy" />` : ""}
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
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("이 메뉴를 삭제할까요?")) return;
      await api.delete(`/admin/menu-items/${btn.dataset.id}`);
      await loadMenuItems();
    });
  });
}

const mobileLayoutQuery = window.matchMedia("(max-width: 720px)");

tbody.addEventListener("click", (e) => {
  if (!mobileLayoutQuery.matches) return;
  if (e.target.closest("a, button")) return;
  const row = e.target.closest("tr[data-id]");
  if (!row) return;
  window.location.href = `/admin/menus/edit?id=${row.dataset.id}`;
});

async function loadMenuItems() {
  MENU_ITEMS = await api.get("/admin/menu-items");
  renderCategoryFilter();
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
  await loadMenuItems();
}

init();

}
