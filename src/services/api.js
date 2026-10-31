const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const telegramInitData = window.Telegram?.WebApp?.initData;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(telegramInitData ? { "X-Telegram-Init-Data": telegramInitData } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `API request failed: ${response.status}`);
    error.code = payload.code;
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const api = {
  getBotStatus: () => request("/api/bot/status"),
  getProfile: () => request("/api/profile"),
  loginAdminWithTelegram: () => request("/api/admin/auth/telegram", { method: "POST" }),
  getProducts: () => request("/api/products"),
  verifyPlayer: (playerId) =>
    request("/api/players/verify", {
      method: "POST",
      body: JSON.stringify({ playerId }),
    }),
  verifyTelegramUser: (username) =>
    request("/api/telegram/verify", {
      method: "POST",
      body: JSON.stringify({ username }),
    }),
  createOrder: (payload) =>
    request("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  createTopUp: (amount) =>
    request("/api/top-ups", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
};
