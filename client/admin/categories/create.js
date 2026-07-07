if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {

document.getElementById("category-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  await api.post("/admin/categories", {
    name: form.get("name"),
    sortOrder: Number(form.get("sortOrder")) || 0,
  });
  location.href = "/admin/categories/list";
});

}
