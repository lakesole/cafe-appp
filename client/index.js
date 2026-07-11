document.getElementById("cart-count").textContent = getCartCount();

async function loadMenuPreview() {
  const grid = document.getElementById("menu-preview-grid");
  try {
    const menuItems = await api.get("/menu-items");
    grid.innerHTML = menuItems
      .slice(0, 8)
      .map(
        (menu) => `
        <li class="menu-preview__card">
          <a href="/menus/detail?id=${menu.id}">
            <div class="menu-preview__thumb">
              <img src="${menu.imageUrl}" alt="${menu.name}" />
            </div>
            <div class="menu-preview__body">
              <p class="menu-preview__name">${menu.name}</p>
              <p class="menu-preview__price">${formatPrice(menu.price)}</p>
            </div>
          </a>
        </li>`
      )
      .join("");
  } catch {
    grid.innerHTML = "";
  }
}

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
