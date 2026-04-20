const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
export const ADMIN_NOTIFICATIONS_UPDATED_EVENT = 'admin-notifications-updated';

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const buildAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});

const parseListOrThrow = (payload) => {
  if (!Array.isArray(payload)) {
    throw new Error('Invalid notifications response from backend.');
  }
  return payload;
};

const emitUpdated = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_NOTIFICATIONS_UPDATED_EVENT));
};

export const getAdminNotifications = async (token) => {
  if (!token) {
    return [];
  }

  const response = await fetch(`${API_BASE_URL}/api/notifications/me`, {
    headers: buildAuthHeader(token),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to load notifications.');
  }

  return parseListOrThrow(payload);
};

export const markAdminNotificationRead = async (token, notificationId) => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/me/${notificationId}/read`, {
    method: 'PATCH',
    headers: buildAuthHeader(token),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to mark notification as read.');
  }

  emitUpdated();
  return payload;
};

export const markAllAdminNotificationsRead = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/me/read-all`, {
    method: 'PATCH',
    headers: buildAuthHeader(token),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to mark all notifications as read.');
  }

  emitUpdated();
  return parseListOrThrow(payload);
};

export const deleteAdminNotification = async (token, notificationId) => {
  const response = await fetch(`${API_BASE_URL}/api/notifications/me/${notificationId}`, {
    method: 'DELETE',
    headers: buildAuthHeader(token),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Unable to delete notification.');
  }

  emitUpdated();
};
