const API_BASE = "/api";

let refreshPromise = null;

/** accessToken 만료 시 refreshToken으로 한 번만 갱신 (동시 요청은 하나의 갱신을 공유) */
async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return null;
      try {
        const res = await fetch(API_BASE + "/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const { accessToken } = await res.json();
        updateAccessToken(accessToken);
        return accessToken;
      } catch {
        return null;
      }
    })();
  }
  const token = await refreshPromise;
  refreshPromise = null;
  return token;
}

async function request(path, options = {}, isRetry = false) {
  const headers = { "Content-Type": "application/json" };
  if (typeof getAccessToken === "function") {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(API_BASE + path, {
    headers,
    ...options,
  });

  if (res.status === 401 && !isRetry && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) return request(path, options, true);
    clearAuth();
    window.location.href = "/auth/login";
    return new Promise(() => {}); /* 로그인 페이지로 이동하는 동안 후속 처리 막기 */
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `요청 실패 (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const api = {
  get: (path) => request(path),
  post: (path, data) => request(path, { method: "POST", body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: "PUT", body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
