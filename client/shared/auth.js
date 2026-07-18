/* ============================================
   로그인 상태 / 토큰 관리 (localStorage)
   ============================================ */

const ACCESS_TOKEN_KEY = "cafeorder_access_token";
const REFRESH_TOKEN_KEY = "cafeorder_refresh_token";
const AUTH_USER_KEY = "cafeorder_user";

function saveAuth({ accessToken, refreshToken, user }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function updateAccessToken(accessToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return Boolean(getAccessToken() && getCurrentUser());
}

function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

async function logout() {
  clearAuth();
  try {
    await api.post("/auth/logout", {});
  } catch {
    /* 로그아웃은 클라이언트에서 토큰 삭제만으로 충분, 서버 요청 실패는 무시 */
  }
  window.location.href = "/";
}

/** 사이드바 하단 사용자 칩(id="nav-auth-link")을 로그인 상태에 맞게 갱신 */
function renderAuthNav() {
  const link = document.getElementById("nav-auth-link");
  const nameEl = document.getElementById("nav-auth-name");
  const statusEl = document.getElementById("nav-auth-status");

  const user = getCurrentUser();

  if (link && nameEl) {
    if (user) {
      nameEl.textContent = `${user.name}님`;
      if (statusEl) statusEl.textContent = "로그인 됨";
      link.href = "/my";
    } else {
      nameEl.textContent = "로그인";
      if (statusEl) statusEl.textContent = "계정에 접속하세요";
      link.href = "/auth/login";
    }
  }

  renderRoleNav(user);
}

const ROLE_NAV_META = {
  ADMIN: { href: "/admin", label: "관리자 페이지", bottomLabel: "관리자" },
  STAFF: { href: "/staff/list", label: "종업원 페이지", bottomLabel: "종업원" },
};

/** 고객 페이지 사이드바/하단 탭바의 관리자·종업원 바로가기(data-role-nav)를 역할에 맞게 갱신 */
function renderRoleNav(user) {
  const meta = user && ROLE_NAV_META[user.role];
  document.querySelectorAll("[data-role-nav]").forEach((el) => {
    el.classList.toggle("is-hidden", !meta);
    if (!meta) return;
    el.href = meta.href;
    const labelEl = el.querySelector("[data-role-nav-label]");
    if (labelEl) labelEl.textContent = el.classList.contains("app-bottom-nav__link") ? meta.bottomLabel : meta.label;
  });
}

/** 관리자/종업원 헤더의 로그아웃 버튼(id="logout-btn")을 로그아웃 동작에 연결 */
function wireLogoutButton() {
  const btn = document.getElementById("logout-btn");
  if (btn) btn.addEventListener("click", logout);
}

renderAuthNav();
wireLogoutButton();
