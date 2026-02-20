const runtimeDefaultApiBase =
  typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";

const API_BASE = (import.meta.env.VITE_API_BASE || runtimeDefaultApiBase).replace(/\/+$/, "");

export function getToken() {
  return localStorage.getItem("dpaper_token");
}

export function setToken(token: string) {
  localStorage.setItem("dpaper_token", token);
}

export function clearToken() {
  localStorage.removeItem("dpaper_token");
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path: string, options: RequestInit = {}) {
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
  lookupFines: (licensePlate: string) =>
    request(`/fines/lookup?licensePlate=${encodeURIComponent(licensePlate)}`),
};
