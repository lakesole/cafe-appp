if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

const categorySelect = document.getElementById("category-select");
const form = document.getElementById("menu-form");

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
