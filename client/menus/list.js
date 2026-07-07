/* ============================================
   고객 - 메뉴 목록 (실제 API 연동: /api/categories, /api/menu-items)
   ============================================ */

const categoryTabsEl = document.getElementById("category-tabs");
const menuGridEl = document.getElementById("menu-grid");
const emptyEl = document.getElementById("empty");
const cartCountEl = document.getElementById("cart-count");
const quickOrderBarEl = document.getElementById("quick-order-bar");
const quickOrderAddedEl = document.getElementById("quick-order-added");
const quickOrderSummaryEl = document.getElementById("quick-order-summary");

let CATEGORIES = [];
let MENU_ITEMS = [];
let activeCategory = "all";

function refreshCartCount() {
  cartCountEl.textContent = getCartCount();
}

function renderTabs() {
  const tabs = [{ id: "all", name: "전체" }, ...CATEGORIES];
  categoryTabsEl.innerHTML = tabs
    .map(
      (tab) => `
      <button type="button" class="cat-tab ${tab.id === activeCategory ? "active" : ""}" data-id="${tab.id}">
        ${tab.name}
      </button>`
    )
    .join("");
}

function renderGrid() {
  const items =
    activeCategory === "all"
      ? MENU_ITEMS
      : MENU_ITEMS.filter((m) => m.categoryId === activeCategory);

  emptyEl.hidden = items.length > 0;

  menuGridEl.innerHTML = items
    .map((menu) => {
      const hasOptions = menu.optionGroups && menu.optionGroups.length > 0;
      return `
      <li class="menu-card">
        <a href="detail?id=${menu.id}">
          <div class="menu-thumb">
            <img src="${menu.imageUrl}" alt="${menu.name}" />
            ${menu.isSoldOut ? '<div class="soldout-overlay">품절</div>' : ""}
          </div>
          <div class="menu-body">
            <p class="menu-name">${menu.name}</p>
            <p class="menu-desc">${menu.description || ""}</p>
          </div>
        </a>
        <div class="menu-body menu-foot">
          <span class="menu-price">${formatPrice(menu.price)}</span>
          <button
            type="button"
            class="add-btn js-quick-add"
            data-id="${menu.id}"
            title="${hasOptions ? "옵션 선택은 상세페이지에서" : "장바구니에 담기"}"
            ${menu.isSoldOut || hasOptions ? "disabled" : ""}
          >+</button>
        </div>
      </li>`;
    })
    .join("");
}

categoryTabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-id]");
  if (!btn) return;
  activeCategory = btn.dataset.id === "all" ? "all" : Number(btn.dataset.id);
  renderTabs();
  renderGrid();
});

function showQuickOrderBar(menu) {
  quickOrderAddedEl.textContent = `${menu.name} 담았어요 🛒`;
  quickOrderSummaryEl.textContent = `장바구니 ${getCartCount()}개 · 총 ${formatPrice(getCartTotal())}`;
  quickOrderBarEl.hidden = false;
}

quickOrderBarEl.addEventListener("click", (e) => {
  if (e.target.closest("#quick-order-close")) {
    quickOrderBarEl.hidden = true;
  }
});

menuGridEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".js-quick-add");
  if (!btn) return;
  const menu = MENU_ITEMS.find((m) => m.id === Number(btn.dataset.id));
  addToCart({
    menuItemId: menu.id,
    name: menu.name,
    unitPrice: menu.price,
    quantity: 1,
    selectedOptions: [],
  });
  refreshCartCount();
  showQuickOrderBar(menu);
});

async function init() {
  refreshCartCount();
  [CATEGORIES, MENU_ITEMS] = await Promise.all([api.get("/categories"), api.get("/menu-items")]);
  renderTabs();
  renderGrid();
}

init().catch(() => {
  menuGridEl.innerHTML = "";
  emptyEl.textContent = "메뉴를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
  emptyEl.hidden = false;
});
