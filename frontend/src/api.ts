const runtimeOrigin = typeof window !== "undefined" ? window.location.origin : "";
const rawApiBase = (import.meta.env.VITE_API_BASE || runtimeOrigin).replace(/\/+$/, "");
const API_BASE = rawApiBase ? (rawApiBase.endsWith("/api") ? rawApiBase : `${rawApiBase}/api`) : "/api";

export function getToken() {
  return localStorage.getItem("dpaper_token");
}

export function getRefreshToken() {
  return localStorage.getItem("dpaper_refresh_token");
}

export function setToken(token: string) {
  localStorage.setItem("dpaper_token", token);
}

export function setRefreshToken(token: string) {
  localStorage.setItem("dpaper_refresh_token", token);
}

export function clearToken() {
  localStorage.removeItem("dpaper_token");
  localStorage.removeItem("dpaper_refresh_token");
}

export function setAuthTokens(accessToken: string, refreshToken?: string | null) {
  setToken(accessToken);
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!res.ok) {
    return false;
  }

  const body = await res.json().catch(() => ({}));
  if (!body?.access_token) {
    return false;
  }
  setAuthTokens(body.access_token, body.refresh_token);
  return true;
}

async function request(path: string, options: RequestInit = {}, retryOn401 = true) {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401 && retryOn401 && path !== "/auth/refresh") {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request(path, options, false);
      }
      clearToken();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new ApiError("Phiên dang nh?p dã h?t h?n", 401);
    }
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.error || `Request failed: ${res.status}`, res.status);
  }
  return res.json();
}

export const api = {
  login: (payload: { username: string; password: string }) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  listUnits: () => request("/units"),
  listDrivers: () => request("/drivers"),
  listVehicles: () => request("/vehicles"),
  listDocuments: () => request("/documents"),
  listMyNotifications: () => request("/notifications/my"),
  lookupFines: (licensePlate: string) =>
    request(`/fines/lookup?licensePlate=${encodeURIComponent(licensePlate)}`),
};