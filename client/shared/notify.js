/* ============================================
   실시간 주문 상태 알림 (Socket.IO)
   ============================================ */

const ORDER_STATUS_NOTIFY_MESSAGE = {
  READY: "주문하신 음식이 완료되었습니다. 픽업해주세요!",
};

let orderNotifyTimer = null;

/* 브라우저는 사용자 상호작용 이전에는 소리 재생을 막는다. 이 앱은 페이지마다
   새로 로드되는 멀티페이지 구조라, "주문 완료 후 결제 페이지에서 클릭" 같은
   이전 페이지의 조작은 다음 페이지(주문내역 등)의 AudioContext에는 적용되지
   않는다 — 즉 주문내역/상세 페이지에 도착해서 아무것도 누르지 않고 기다리기만
   하면 그 페이지에서는 "잠금 해제 제스처"가 한 번도 발생하지 않는다.
   그래서 (1) 스크립트 로드 시점에 일단 만들어 재생을 시도해보고,
   (2) 클릭/키 입력/화면 복귀 시점마다 계속 재시도해서 성공 확률을 최대화한다. */
let audioCtx = null;

function ensureAudioCtx() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

function tryResumeAudioCtx() {
  const ctx = ensureAudioCtx();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
}

tryResumeAudioCtx();
["pointerdown", "keydown", "touchend"].forEach((type) => {
  document.addEventListener(type, tryResumeAudioCtx);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") tryResumeAudioCtx();
});

async function playOrderNotifySound() {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume().catch(() => {});
  }
  /* resume이 실패해 계속 suspended 상태면(제스처가 아직 한 번도 없었던 경우)
     오실레이터를 예약해도 소리가 나지 않으므로 조용히 포기한다 — 이후 사용자가
     페이지의 아무 곳이나 누르면 위 리스너가 다시 resume을 시도한다. */
  if (ctx.state !== "running") return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 1046.5, start: 0, duration: 0.16 },
    { freq: 1568.0, start: 0.12, duration: 0.28 },
  ];

  notes.forEach(({ freq, start, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(0.25, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
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

  /* accessToken은 15분 후 만료된다. 소켓이 오래 연결돼 있다가 (모바일 화면
     잠금/네트워크 전환 등으로) 재연결을 시도할 때, 접속 시점에 캡처해둔 토큰이
     이미 만료된 상태로 재사용되면 서버가 인증에 실패해 room에 재참여하지 못하고
     이후 알림을 영영 받지 못한다. auth를 콜백으로 넘겨 매 (재)연결 시도마다
     최신 토큰을 다시 읽고, 인증 실패 시에는 갱신까지 시도한다. */
  const socket = io({ auth: (cb) => cb({ token: getAccessToken() }) });

  socket.on("connect_error", async () => {
    if (typeof refreshAccessToken !== "function") return;
    const newToken = await refreshAccessToken();
    /* socket.io는 인증 실패로 거부된 연결을 자동으로 재시도하지 않으므로,
       갱신에 성공했을 때만 새 토큰으로 다시 접속을 시도한다. */
    if (newToken) socket.connect();
  });

  socket.on("order:status", (order) => {
    const message = ORDER_STATUS_NOTIFY_MESSAGE[order.status];
    if (message) showOrderNotify(message, order.id);
  });
})();
