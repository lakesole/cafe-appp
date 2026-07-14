/* ============================================
   관리자 - 문의 상세 / 답변 (실제 API 연동)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
} else {
  const detailEl = document.getElementById("detail");
  const questionId = Number(new URLSearchParams(location.search).get("id"));

  function renderNotFound() {
    detailEl.innerHTML = `
      <p class="not-found">
        존재하지 않는 문의입니다.<br />
        <a href="list" class="back-link">QnA 관리로 돌아가기</a>
      </p>`;
  }

  function renderQuestion(q) {
    detailEl.innerHTML = `
      <div class="qna-detail-card__top">
        <h1 class="qna-detail-card__title">${q.title}</h1>
        <span class="qna-detail-card__badge ${q.answer ? "is-answered" : "is-waiting"}">${q.answer ? "답변 완료" : "답변 대기"}</span>
      </div>
      <p class="qna-detail-card__meta">${q.user.name} (${q.user.username}) · ${formatDateTime(q.createdAt)}</p>
      <p class="qna-detail-card__content">${q.content}</p>

      <form class="answer-form" id="answer-form">
        <label>
          답변 내용
          <textarea name="answer" rows="5" placeholder="답변을 입력해주세요">${q.answer || ""}</textarea>
        </label>
        <button type="submit" class="btn">${q.answer ? "답변 수정" : "답변 등록"}</button>
        ${q.answeredAt ? `<p class="qna-detail-card__answered-at">마지막 답변일시: ${formatDateTime(q.answeredAt)}</p>` : ""}
      </form>
    `;

    document.getElementById("answer-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const answer = e.target.answer.value.trim();
      if (!answer) return;
      const submitBtn = e.target.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      try {
        const updated = await api.patch(`/admin/questions/${q.id}/answer`, { answer });
        showToast("답변을 등록했어요.");
        renderQuestion(updated);
      } catch (err) {
        showToast(err.message || "답변 등록에 실패했습니다.");
        submitBtn.disabled = false;
      }
    });
  }

  async function init() {
    try {
      const question = await api.get(`/admin/questions/${questionId}`);
      renderQuestion(question);
    } catch {
      renderNotFound();
    }
  }

  init();
}
