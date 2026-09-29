const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function request(path, options = {}) {
  const token = localStorage.getItem("relay-token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error || "Request failed.");
  }

  return body;
}
