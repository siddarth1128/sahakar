// Simple API helper for FixItNow frontend
// Adds Authorization header from localStorage token and uses REACT_APP_API_URL

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function apiGet(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.msg || data?.error || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export async function apiPost(path, body = {}, options = {}) {
  return apiGet(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

export async function apiPut(path, body = {}, options = {}) {
  return apiGet(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
}

export { API_BASE };
