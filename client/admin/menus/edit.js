if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const menuId = new URLSearchParams(location.search).get("id");
const categorySelect = document.getElementById("category-select");
const form = document.getElementById("menu-form");
const deleteBtn = document.getElementById("delete-btn");
const previewImg = document.getElementById("preview-img");
const previewEmpty = document.getElementById("preview-empty");
const previewName = document.getElementById("preview-name");
const previewPrice = document.getElementById("preview-price");

function updatePreview() {
  const imageUrl = form.imageUrl.value.trim();
  if (imageUrl) {
    previewImg.src = imageUrl;
    previewImg.hidden = false;
    previewEmpty.hidden = true;
  } else {
    previewImg.hidden = true;
    previewEmpty.hidden = false;
  }
  previewName.textContent = form.name.value.trim() || "메뉴 이름";
  const price = Number(form.price.value) || 0;
  previewPrice.textContent = `${price.toLocaleString("ko-KR")}원`;
}

form.addEventListener("input", updatePreview);

async function loadForm() {
  const [categories, menuItem] = await Promise.all([
    api.get("/admin/categories"),
    api.get(`/admin/menu-items/${menuId}`),
  ]);
  categorySelect.innerHTML = categories
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  form.categoryId.value = menuItem.categoryId;
  form.name.value = menuItem.name;
  form.description.value = menuItem.description || "";
  form.price.value = menuItem.price;
  form.imageUrl.value = menuItem.imageUrl || "";
  form.isSoldOut.checked = menuItem.isSoldOut;
  updatePreview();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  await api.put(`/admin/menu-items/${menuId}`, {
    categoryId: data.get("categoryId"),
    name: data.get("name"),
    description: data.get("description"),
    price: data.get("price"),
    imageUrl: data.get("imageUrl"),
    isSoldOut: data.get("isSoldOut") === "on",
  });
  location.href = "/admin/menus/list";
});

deleteBtn.addEventListener("click", async () => {
  if (!confirm("이 메뉴를 삭제할까요?")) return;
  await api.delete(`/admin/menu-items/${menuId}`);
  location.href = "/admin/menus/list";
});

loadForm();

}
