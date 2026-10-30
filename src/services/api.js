const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getBotStatus: () => request("/api/bot/status"),
  getProfile: () => request("/api/profile"),
  getProducts: () => request("/api/products"),
  verifyPlayer: (playerId) =>
    request("/api/players/verify", {
      method: "POST",
      body: JSON.stringify({ playerId }),
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
