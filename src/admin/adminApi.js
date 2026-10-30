const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/api/admin${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error ?? "So‘rov bajarilmadi");
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const adminApi = {
  me: () => request("/auth/me"),
  login: (username, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  packages: () => request("/packages"),
  providerPackages: () => request("/provider-packages"),
  createPackage: (data) => request("/packages", { method: "POST", body: JSON.stringify(data) }),
  updatePackage: (id, data) => request(`/packages/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePackage: (id) => request(`/packages/${id}`, { method: "DELETE" }),
  botStatus: () => request("/bot"),
  setBotStatus: (enabled) => request("/bot", { method: "PATCH", body: JSON.stringify({ enabled }) }),
  orders: (params = {}) => request(`/orders?${new URLSearchParams(params)}`),
  order: (id) => request(`/orders/${id}`),
  statistics: (month) => request(`/statistics?${new URLSearchParams({ month })}`),
  paymentCards: () => request("/payment-cards"),
  createPaymentCard: (data) => request("/payment-cards", { method: "POST", body: JSON.stringify(data) }),
  updatePaymentCard: (id, data) => request(`/payment-cards/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deletePaymentCard: (id) => request(`/payment-cards/${id}`, { method: "DELETE" }),
};
