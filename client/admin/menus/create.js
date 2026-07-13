if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const categorySelect = document.getElementById("category-select");
const form = document.getElementById("menu-form");
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

async function loadCategories() {
  const categories = await api.get("/admin/categories");
  categorySelect.innerHTML = categories
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  await api.post("/admin/menu-items", {
    categoryId: data.get("categoryId"),
    name: data.get("name"),
    description: data.get("description"),
    price: data.get("price"),
    imageUrl: data.get("imageUrl"),
    isSoldOut: data.get("isSoldOut") === "on",
  });
  location.href = "/admin/menus/list";
});

loadCategories();

}
