const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const buildAuthHeaders = (token, hasBody = false) => {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const ensureArrayPayload = (payload, defaultMessage) => {
  if (!Array.isArray(payload)) {
    throw new Error(defaultMessage);
  }

  return payload;
};

const handleApiError = (response, payload, fallbackMessage) => {
  if (!response.ok) {
    throw new Error(payload?.message || fallbackMessage);
  }
};

export const getHotels = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/hotels`, {
    headers: buildAuthHeaders(token),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to load hotels.');
  return ensureArrayPayload(payload, 'Invalid hotels response from backend.');
};

export const getHotelSuggestions = async (
  token,
  { destination = '', country = '', tourSlug = '', limit = 6 } = {}
) => {
  const normalizedTourSlug = String(tourSlug || '').trim();
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 6));
  const endpoint = normalizedTourSlug
    ? `${API_BASE_URL}/api/hotels/suggestions/by-tour/${encodeURIComponent(normalizedTourSlug)}?limit=${safeLimit}`
    : `${API_BASE_URL}/api/hotels/suggestions?destination=${encodeURIComponent(destination || '')}&country=${encodeURIComponent(country || '')}&limit=${safeLimit}`;

  const response = await fetch(endpoint, {
    headers: buildAuthHeaders(token),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to load hotel suggestions.');
  return ensureArrayPayload(payload, 'Invalid hotel suggestions response from backend.');
};

export const createHotelBooking = async (token, bookingInput) => {
  const response = await fetch(`${API_BASE_URL}/api/hotel-bookings`, {
    method: 'POST',
    headers: buildAuthHeaders(token, true),
    body: JSON.stringify(bookingInput),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to create hotel booking.');
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid hotel booking response from backend.');
  }

  return payload;
};

export const getMyHotelBookings = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/hotel-bookings/me`, {
    headers: buildAuthHeaders(token),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to load your hotel bookings.');
  return ensureArrayPayload(payload, 'Invalid hotel bookings response from backend.');
};

export const cancelMyHotelBooking = async (token, hotelBookingRecordId) => {
  const response = await fetch(`${API_BASE_URL}/api/hotel-bookings/me/${hotelBookingRecordId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to cancel hotel booking.');
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid cancel booking response from backend.');
  }

  return payload;
};

export const getAdminHotels = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/hotels`, {
    headers: buildAuthHeaders(token),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to load hotels.');
  return ensureArrayPayload(payload, 'Invalid admin hotels response from backend.');
};

export const createAdminHotel = async (token, hotelInput) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/hotels`, {
    method: 'POST',
    headers: buildAuthHeaders(token, true),
    body: JSON.stringify(hotelInput),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to create hotel.');
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid create hotel response from backend.');
  }

  return payload;
};

export const updateAdminHotel = async (token, hotelId, hotelInput) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/hotels/${hotelId}`, {
    method: 'PUT',
    headers: buildAuthHeaders(token, true),
    body: JSON.stringify(hotelInput),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to update hotel.');
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid update hotel response from backend.');
  }

  return payload;
};

export const deleteAdminHotel = async (token, hotelId) => {
  const response = await fetch(`${API_BASE_URL}/api/admin/hotels/${hotelId}`, {
    method: 'DELETE',
    headers: buildAuthHeaders(token),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to delete hotel.');
};

export const getAdminHotelBookings = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/hotel-bookings/admin`, {
    headers: buildAuthHeaders(token),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to load hotel bookings.');
  return ensureArrayPayload(payload, 'Invalid hotel bookings response from backend.');
};

export const updateAdminHotelBookingStatus = async (token, hotelBookingRecordId, status, adminNote = '') => {
  const response = await fetch(`${API_BASE_URL}/api/hotel-bookings/admin/${hotelBookingRecordId}/status`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token, true),
    body: JSON.stringify({
      status,
      adminNote,
    }),
  });

  const payload = await parseJsonSafe(response);
  handleApiError(response, payload, 'Unable to update hotel booking status.');
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid hotel booking status response from backend.');
  }

  return payload;
};
