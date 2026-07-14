/* ============================================
   실시간 주문 상태 알림 (Socket.IO)
   ============================================ */

const ORDER_STATUS_NOTIFY_MESSAGE = {
  READY: "주문하신 음식이 완료되었습니다. 픽업해주세요!",
};

let orderNotifyTimer = null;

/* 브라우저는 사용자 상호작용 이전에 소리 재생을 막기 때문에,
   페이지에서 첫 클릭/터치가 발생할 때 AudioContext를 미리 깨워둔다. */
let audioCtx = null;

function unlockOrderNotifySound() {
  if (audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audioCtx = new Ctx();
  document.removeEventListener("pointerdown", unlockOrderNotifySound);
  document.removeEventListener("keydown", unlockOrderNotifySound);
}
document.addEventListener("pointerdown", unlockOrderNotifySound, { once: true });
document.addEventListener("keydown", unlockOrderNotifySound, { once: true });

function playOrderNotifySound() {
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume();

  const now = audioCtx.currentTime;
  const notes = [
    { freq: 1046.5, start: 0, duration: 0.16 },
    { freq: 1568.0, start: 0.12, duration: 0.28 },
  ];

  notes.forEach(({ freq, start, duration }) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(0.25, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.02);
  });
}

function ensureOrderNotifyEl() {
  let el = document.getElementById("order-notify");
  if (el) return el;

  el = document.createElement("button");
  el.type = "button";
  el.id = "order-notify";
  el.className = "order-notify";
  el.innerHTML = `
    <svg class="order-notify__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6 9 17l-5-5" /></svg>
    <span class="order-notify__text"></span>
  `;
  document.body.appendChild(el);
  return el;
}

function showOrderNotify(message, orderId) {
  const el = ensureOrderNotifyEl();
  el.querySelector(".order-notify__text").textContent = message;
  el.onclick = orderId ? () => { window.location.href = `/orders/detail?id=${orderId}`; } : null;
  el.classList.add("is-visible");
  playOrderNotifySound();

  clearTimeout(orderNotifyTimer);
  orderNotifyTimer = setTimeout(() => {
    el.classList.remove("is-visible");
  }, 5000);
}

(function initOrderStatusSocket() {
  if (typeof isLoggedIn !== "function" || !isLoggedIn()) return;
  if (typeof io !== "function") return;

  const socket = io({ auth: { token: getAccessToken() } });

  socket.on("order:status", (order) => {
    const message = ORDER_STATUS_NOTIFY_MESSAGE[order.status];
    if (message) showOrderNotify(message, order.id);
  });
})();
