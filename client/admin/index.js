/* ============================================
   관리자 - 대시보드 (ADMIN 로그인 가드)
   ============================================ */

if (!isLoggedIn() || getCurrentUser().role !== "ADMIN") {
  window.location.href = "/auth/login";
}
