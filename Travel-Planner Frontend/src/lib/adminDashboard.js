const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const getAdminDashboardOverview = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to load admin dashboard overview.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid dashboard response from backend.');
  }

  return payload;
};
