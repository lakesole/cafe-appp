const categoryId = new URLSearchParams(location.search).get("id");
const form = document.getElementById("category-form");

async function loadCategory() {
  const category = await api.get(`/admin/categories/${categoryId}`);
  form.name.value = category.name;
  form.sortOrder.value = category.sortOrder;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  await api.put(`/admin/categories/${categoryId}`, {
    name: data.get("name"),
    sortOrder: Number(data.get("sortOrder")) || 0,
  });
  location.href = "/admin/categories/list";
});

loadCategory();
