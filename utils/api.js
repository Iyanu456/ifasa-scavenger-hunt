function getToken() {
  return localStorage.getItem('ias3_admin_token');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  getCode: (slug) => request(`/api/codes/${slug}`),
  register: (body) => request('/api/register', { method: 'POST', body: JSON.stringify(body) }),
  scan: (body) => request('/api/scan', { method: 'POST', body: JSON.stringify(body) }),
  leaderboard: () => request('/api/leaderboard'),
  admin: {
    login: (body) => request('/api/admin/login', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request('/api/admin/me'),
    participants: () => request('/api/admin/participants'),
    scans: () => request('/api/admin/scans'),
    codes: () => request('/api/admin/codes'),
    toggleCode: (slug, active) => request(`/api/admin/codes/${slug}`, { method: 'PATCH', body: JSON.stringify({ active }) }),
    updateCoords: (slug, lat, lng) => request(`/api/admin/codes/${slug}`, { method: 'PATCH', body: JSON.stringify({ lat, lng }) }),
    stats: () => request('/api/admin/stats'),
    deleteParticipant: (phone) =>
      request(`/api/admin/participants/${encodeURIComponent(phone)}`, { method: 'DELETE' }),
    setDisqualified: (phone, disqualified) =>
      request(`/api/admin/participants/${encodeURIComponent(phone)}`, { method: 'PATCH', body: JSON.stringify({ disqualified }) }),
  },
};
