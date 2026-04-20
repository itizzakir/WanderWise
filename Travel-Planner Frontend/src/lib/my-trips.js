const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export const getMyTrips = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/trips/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to load trips.');
  }

  if (!Array.isArray(payload)) {
    throw new Error('Invalid trips response from backend.');
  }

  return payload;
};

export const getMyTripDetails = async (token, tripId) => {
  const response = await fetch(`${API_BASE_URL}/api/trips/me/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to load trip details.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid trip details response from backend.');
  }

  return payload;
};
