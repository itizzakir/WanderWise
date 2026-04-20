const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const postJson = async (path, body) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error(payload?.message || 'Something went wrong while calling the AI service.');
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid AI service response.');
  }

  return payload;
};

export const sendChatMessage = (body) => postJson('/api/chat', body);

export const getTravelRecommendation = (body) => postJson('/api/recommend', body);

export const getTravelModeSuggestion = (body) => postJson('/api/travel-mode', body);
