/* ============================================
   고객 - 오시는 길
   ============================================ */

refreshCartBadges();

async function loadSeatStatus() {
  const badgeEl = document.getElementById("seat-badge");
  try {
    const { seatStatus } = await api.get("/store-status");
    const isFull = seatStatus === "FULL";
    badgeEl.textContent = isFull ? "만석" : "좌석 가능";
    badgeEl.classList.toggle("seat-badge--full", isFull);
    badgeEl.hidden = false;
  } catch {
    badgeEl.hidden = true;
  }
}

loadSeatStatus();
