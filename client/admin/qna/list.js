/* ============================================
   관리자 - QnA 관리 (실제 API 연동: /api/admin/questions)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {
  const statusTabsEl = document.getElementById("status-tabs");
  const listEl = document.getElementById("qna-admin-list");
  const emptyEl = document.getElementById("empty");

  let ALL_QUESTIONS = [];
  let activeFilter = "all";

  function renderTabs() {
    const waitingCount = ALL_QUESTIONS.filter((q) => !q.answer).length;
    const tabs = [
      { id: "all", label: `전체 (${ALL_QUESTIONS.length})` },
      { id: "waiting", label: `답변 대기 (${waitingCount})` },
      { id: "answered", label: `답변 완료 (${ALL_QUESTIONS.length - waitingCount})` },
    ];
    statusTabsEl.innerHTML = tabs
      .map(
        (tab) => `
        <button type="button" class="status-tab ${tab.id === activeFilter ? "active" : ""}" data-id="${tab.id}">
          ${tab.label}
        </button>`
      )
      .join("");
  }

  function renderList() {
    const filtered = ALL_QUESTIONS.filter((q) => {
      if (activeFilter === "waiting") return !q.answer;
      if (activeFilter === "answered") return !!q.answer;
      return true;
    });

    emptyEl.hidden = filtered.length > 0;
    listEl.innerHTML = filtered
      .map(
        (q) => `
      <li class="qna-admin-card">
        <a href="detail?id=${q.id}">
          <div class="qna-admin-card__head">
            <span class="qna-admin-card__title">${q.title}</span>
            <span class="qna-admin-card__badge ${q.answer ? "is-answered" : "is-waiting"}">${q.answer ? "답변 완료" : "답변 대기"}</span>
          </div>
          <p class="qna-admin-card__meta">${q.user.name} · ${formatDateTime(q.createdAt)}</p>
        </a>
      </li>`
      )
      .join("");
  }

  statusTabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-id]");
    if (!btn) return;
    activeFilter = btn.dataset.id;
    renderTabs();
    renderList();
  });

  async function init() {
    ALL_QUESTIONS = await api.get("/admin/questions");
    renderTabs();
    renderList();
  }

  init();
}
