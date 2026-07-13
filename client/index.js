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

async function loadMenuPreview() {
  const grid = document.getElementById("menu-preview-grid");
  try {
    const menuItems = await api.get("/menu-items");
    PREVIEW_MENU_ITEMS = menuItems;
    grid.innerHTML = menuItems
      .slice(0, 8)
      .map(
        (menu) => `
        <li class="menu-preview__card">
          <a href="/menus/detail?id=${menu.id}">
            <div class="menu-preview__thumb">
              <img src="${menu.imageUrl}" alt="${menu.name}" />
              ${menu.isSoldOut ? '<div class="menu-preview__soldout">품절</div>' : ""}
            </div>
            <p class="menu-preview__name">${menu.name}</p>
          </a>
          <div class="menu-preview__foot">
            <span class="menu-preview__price">${formatPrice(menu.price)}</span>
            <button type="button" class="btn-order-now js-order-now" data-id="${menu.id}" ${menu.isSoldOut ? "disabled" : ""}>바로 주문</button>
          </div>
        </li>`
      )
      .join("");
  } catch {
    grid.innerHTML = "";
  }
}

document.getElementById("menu-preview-grid").addEventListener("click", (e) => {
  const btn = e.target.closest(".js-order-now");
  if (!btn) return;
  const menu = PREVIEW_MENU_ITEMS.find((m) => m.id === Number(btn.dataset.id));
  if (!menu) return;
  const selectedOptions = getDefaultSelectedOptions(menu);
  const extraTotal = selectedOptions.reduce((sum, o) => sum + o.extraPrice, 0);
  addToCart({
    menuItemId: menu.id,
    name: menu.name,
    unitPrice: menu.price + extraTotal,
    quantity: 1,
    selectedOptions,
  });
  window.location.href = "/checkout";
});

loadMenuPreview();

/* 포스터 슬라이드쇼 (자동 재생 + 점 클릭 + 마우스 드래그/터치 스와이프) */
function initPosterSlideshow() {
  const poster = document.getElementById("poster");
  const slides = document.querySelectorAll("#poster-slides .poster__slide");
  const dots = document.querySelectorAll("#poster-dots .poster__dot");
  if (!poster || !slides.length) return;

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

  /* 마우스 드래그 / 손가락 스와이프 */
  let dragStartX = null;
  let dragging = false;

  poster.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
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
    }
    dragStartX = null;
  });

  poster.addEventListener("pointercancel", () => {
    dragging = false;
    poster.classList.remove("is-dragging");
    dragStartX = null;
  });

  startAutoplay();
}

initPosterSlideshow();
