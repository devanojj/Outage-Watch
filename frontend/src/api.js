const API_BASE = "http://127.0.0.1:8000";

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getTargets() {
  return request("/targets");
}

export function createTarget(name, url) {
  return request("/targets", {
    method: "POST",
    body: JSON.stringify({ name, url }),
  });
}

export function deleteTarget(id) {
  return request(`/targets/${id}`, { method: "DELETE" });
}

export function getHistory(id, hours = 24) {
  return request(`/targets/${id}/history?hours=${hours}`);
}
