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

/** 헤더의 로그인/사용자명 링크(id="nav-auth-link")를 로그인 상태에 맞게 갱신 */
function renderAuthNav() {
  const link = document.getElementById("nav-auth-link");
  if (!link) return;

  const user = getCurrentUser();
  if (user) {
    link.textContent = `${user.name}님`;
    link.href = "/my";
  } else {
    link.textContent = "로그인";
    link.href = "/auth/login";
  }
}

renderAuthNav();
