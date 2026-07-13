document.getElementById("cart-count").textContent = getCartCount();

let PREVIEW_MENU_ITEMS = [];

/** 필수 옵션 그룹은 첫 번째 선택지를 기본값으로 담는다 (선택 옵션은 담지 않음) */
function getDefaultSelectedOptions(menu) {
  return (menu.optionGroups || [])
    .filter((group) => group.isRequired && group.optionChoices.length > 0)
    .map((group) => {
      const choice = group.optionChoices[0];
      return {
        optionChoiceId: choice.id,
        groupName: group.name,
        choiceName: choice.name,
        extraPrice: choice.extraPrice,
      };
    });
}

function renderMenuPreview(menuItems) {
  const grid = document.getElementById("menu-preview-grid");
  grid.innerHTML = menuItems
    .slice(0, 8)
    .map((menu) => {
      const hasOptions = menu.optionGroups && menu.optionGroups.length > 0;
      return `
      <li class="menu-preview__card">
        <a href="/menus/detail?id=${menu.id}">
          <div class="menu-preview__thumb">
            <img src="${menu.imageUrl}" alt="${menu.name}" />
            ${menu.isSoldOut ? '<div class="menu-preview__soldout">품절</div>' : ""}
          </div>
          <div class="menu-preview__body">
            <p class="menu-preview__name">${menu.name}</p>
            <p class="menu-preview__desc">${menu.description || ""}</p>
          </div>
        </a>
        <div class="menu-preview__body menu-preview__foot">
          <span class="menu-preview__price">${formatPrice(menu.price)}</span>
          <div class="menu-preview__foot-actions">
            <button type="button" class="btn-order-now js-order-now" data-id="${menu.id}" ${menu.isSoldOut ? "disabled" : ""}>바로 주문</button>
            <button
              type="button"
              class="add-btn js-quick-add"
              data-id="${menu.id}"
              title="${hasOptions ? "기본 옵션으로 담기 (옵션 변경은 상세페이지에서)" : "장바구니에 담기"}"
              ${menu.isSoldOut ? "disabled" : ""}
            >+</button>
          </div>
        </div>
      </li>`;
    })
    .join("");
}

function addPreviewMenuToCart(menu) {
  const selectedOptions = getDefaultSelectedOptions(menu);
  const extraTotal = selectedOptions.reduce((sum, o) => sum + o.extraPrice, 0);
  addToCart({
    menuItemId: menu.id,
    name: menu.name,
    imageUrl: menu.imageUrl,
    unitPrice: menu.price + extraTotal,
    quantity: 1,
    selectedOptions,
  });
  return selectedOptions;
}

document.getElementById("menu-preview-grid").addEventListener("click", (e) => {
  const orderNowBtn = e.target.closest(".js-order-now");
  if (orderNowBtn) {
    const menu = PREVIEW_MENU_ITEMS.find((m) => m.id === Number(orderNowBtn.dataset.id));
    if (!menu) return;
    addPreviewMenuToCart(menu);
    window.location.href = "/checkout";
    return;
  }

  const addBtn = e.target.closest(".js-quick-add");
  if (!addBtn) return;
  const menu = PREVIEW_MENU_ITEMS.find((m) => m.id === Number(addBtn.dataset.id));
  if (!menu) return;
  addPreviewMenuToCart(menu);
  document.getElementById("cart-count").textContent = getCartCount();
  showToast(`${menu.name} 담았어요 🛒`);
});

/* 포스터 슬라이드쇼 (자동 재생 + 점 클릭 + 마우스 드래그/터치 스와이프 + 메뉴 클릭 이동) */
function initPosterSlideshow(menuItems) {
  const poster = document.getElementById("poster");
  const slides = document.querySelectorAll("#poster-slides .poster__slide");
  const dots = document.querySelectorAll("#poster-dots .poster__dot");
  if (!poster || !slides.length) return;

  slides.forEach((slide) => {
    const menuName = slide.dataset.menuName;
    if (!menuName) return;
    const menu = menuItems.find((m) => m.name === menuName);
    if (!menu) return;
    slide.dataset.menuId = menu.id;
    slide.classList.add("is-clickable");
  });

  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === current));
  }

  function startAutoplay() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearInterval(timer);
    timer = setInterval(() => show(current + 1), 4500);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.index));
      startAutoplay();
    });
  });

  const prevBtn = document.getElementById("poster-prev");
  const nextBtn = document.getElementById("poster-next");
  prevBtn?.addEventListener("click", () => {
    show(current - 1);
    startAutoplay();
  });
  nextBtn?.addEventListener("click", () => {
    show(current + 1);
    startAutoplay();
  });

  /* 마우스 드래그 / 손가락 스와이프 + 탭(클릭)으로 메뉴 이동 */
  let dragStartX = null;
  let dragging = false;
  let downSlide = null;

  poster.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    downSlide = e.target.closest(".poster__slide");
    dragStartX = e.clientX;
    dragging = true;
    poster.classList.add("is-dragging");
    poster.setPointerCapture(e.pointerId);
  });

  poster.addEventListener("pointerup", (e) => {
    if (!dragging || dragStartX === null) return;
    const delta = e.clientX - dragStartX;
    dragging = false;
    poster.classList.remove("is-dragging");
    if (Math.abs(delta) > 40) {
      show(current + (delta < 0 ? 1 : -1));
      startAutoplay();
    } else if (downSlide && downSlide.classList.contains("is-clickable")) {
      window.location.href = `/menus/detail?id=${downSlide.dataset.menuId}`;
    }
    dragStartX = null;
    downSlide = null;
  });

  poster.addEventListener("pointercancel", () => {
    dragging = false;
    poster.classList.remove("is-dragging");
    dragStartX = null;
    downSlide = null;
  });

  startAutoplay();
}

async function main() {
  try {
    const menuItems = await api.get("/menu-items");
    PREVIEW_MENU_ITEMS = menuItems;
    renderMenuPreview(menuItems);
    initPosterSlideshow(menuItems);
  } catch {
    document.getElementById("menu-preview-grid").innerHTML = "";
    initPosterSlideshow([]);
  }
}

main();
