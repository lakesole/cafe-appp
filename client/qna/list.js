/* ============================================
   고객 - 문의하기 (실제 API 연동: /api/questions)
   ============================================ */

if (!isLoggedIn()) {
  window.location.href = "/auth/login";
} else {
  document.getElementById("cart-count").textContent = getCartCount();

  const formEl = document.getElementById("qna-form");
  const listEl = document.getElementById("qna-list");
  const emptyEl = document.getElementById("empty");

  function renderList(questions) {
    emptyEl.hidden = questions.length > 0;
    listEl.innerHTML = questions
      .map(
        (q) => `
      <li class="qna-item">
        <div class="qna-item__head">
          <p class="qna-item__title">${q.title}</p>
          <span class="qna-item__badge ${q.answer ? "is-answered" : "is-waiting"}">${q.answer ? "답변 완료" : "답변 대기"}</span>
        </div>
        <p class="qna-item__date">${formatDateTime(q.createdAt)}</p>
        <p class="qna-item__content">${q.content}</p>
        ${
          q.answer
            ? `<div class="qna-item__answer">
                <p class="qna-item__answer-label">New Lake 답변</p>
                <p>${q.answer}</p>
              </div>`
            : ""
        }
      </li>`
      )
      .join("");
  }

  async function loadQuestions() {
    const questions = await api.get("/questions/me");
    renderList(questions);
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = formEl.title.value.trim();
    const content = formEl.content.value.trim();
    if (!title || !content) return;

    const submitBtn = formEl.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    try {
      await api.post("/questions", { title, content });
      formEl.reset();
      showToast("문의가 등록되었어요. 답변을 기다려주세요!");
      loadQuestions();
    } catch (err) {
      showToast(err.message || "문의 등록에 실패했습니다.");
    } finally {
      submitBtn.disabled = false;
    }
  });

  loadQuestions();
}
