/* ============================================
   고객 - 메뉴 상세 (실제 API 연동: /api/menu-items/:id)
   ============================================ */

const detailEl = document.getElementById("detail");

function refreshCartCount() {
  refreshCartBadges();
}
refreshCartCount();

function renderNotFound() {
  detailEl.innerHTML = `
    <p class="not-found">
      존재하지 않는 메뉴입니다.<br />
      <a href="list" class="back-link">메뉴 목록으로 돌아가기</a>
    </p>`;
}

function renderMenu(menu) {
  const optionGroupsHtml = (menu.optionGroups || [])
    .map(
      (group) => `
      <div class="option-group" data-group-id="${group.id}" data-required="${group.isRequired}">
        <p class="option-group__name">
          ${group.name}
          ${group.isRequired ? '<span class="option-group__required">필수</span>' : ""}
        </p>
        ${group.optionChoices
          .map(
            (choice, i) => `
            <label class="option-choice">
              <input
                type="radio"
                name="group-${group.id}"
                value="${choice.id}"
                data-name="${choice.name}"
                data-extra="${choice.extraPrice}"
                ${group.isRequired && i === 0 ? "checked" : ""}
              />
              ${choice.name}
              ${choice.extraPrice > 0 ? `<span class="option-choice__extra">+${formatPrice(choice.extraPrice)}</span>` : ""}
            </label>`
          )
          .join("")}
      </div>`
    )
    .join("");

  detailEl.innerHTML = `
    <div class="detail-media">
      <img src="${menu.imageUrl}" alt="${menu.name}" />
      ${menu.isSoldOut ? '<div class="detail-soldout">품절</div>' : ""}
    </div>
    <div class="detail-info">
      <h1 class="detail-name">${menu.name}</h1>
      <p class="detail-desc">${menu.description || ""}</p>
      <p class="detail-price">${formatPrice(menu.price)}</p>

      ${optionGroupsHtml}

      <div class="qty-row">
        <span class="qty-label">수량</span>
        <div class="qty-control">
          <button type="button" class="qty-btn" id="qty-minus">−</button>
          <span class="qty-value" id="qty-value">1</span>
          <button type="button" class="qty-btn" id="qty-plus">+</button>
        </div>
      </div>

      <div class="detail-actions">
        <button type="button" class="btn btn-outline" id="btn-cart" ${menu.isSoldOut ? "disabled" : ""}>
          장바구니 담기
        </button>
        <button type="button" class="btn btn-primary" id="btn-order" ${menu.isSoldOut ? "disabled" : ""}>
          바로 주문
        </button>
      </div>
    </div>`;

  let qty = 1;
  const qtyValueEl = document.getElementById("qty-value");
  document.getElementById("qty-minus").addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    qtyValueEl.textContent = qty;
  });
  document.getElementById("qty-plus").addEventListener("click", () => {
    qty += 1;
    qtyValueEl.textContent = qty;
  });

  function collectSelectedOptions() {
    const selected = [];
    let extraTotal = 0;
    detailEl.querySelectorAll(".option-group").forEach((groupEl) => {
      const checked = groupEl.querySelector("input:checked");
      if (checked) {
        selected.push({
          optionChoiceId: Number(checked.value),
          groupName: groupEl.querySelector(".option-group__name").textContent.trim(),
          choiceName: checked.dataset.name,
          extraPrice: Number(checked.dataset.extra),
        });
        extraTotal += Number(checked.dataset.extra);
      }
    });
    return { selected, extraTotal };
  }

  function addCurrentToCart() {
    const { selected, extraTotal } = collectSelectedOptions();
    addToCart({
      menuItemId: menu.id,
      name: menu.name,
      imageUrl: menu.imageUrl,
      unitPrice: menu.price + extraTotal,
      quantity: qty,
      selectedOptions: selected,
    });
  }

  document.getElementById("btn-cart").addEventListener("click", () => {
    addCurrentToCart();
    refreshCartCount();
    showToast(`${menu.name} ${qty}개를 담았어요 🛒`);
  });

  document.getElementById("btn-order").addEventListener("click", () => {
    addCurrentToCart();
    window.location.href = "/basket/list";
  });
}

async function init() {
  const menuId = Number(new URLSearchParams(location.search).get("id"));
  try {
    const menu = await api.get(`/menu-items/${menuId}`);
    renderMenu(menu);
  } catch {
    renderNotFound();
  }
}

init();
