if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const menuId = new URLSearchParams(location.search).get("id");
const categorySelect = document.getElementById("category-select");
const form = document.getElementById("menu-form");

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

loadForm();

}
