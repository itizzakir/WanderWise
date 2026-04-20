import { useEffect, useState } from 'react';

const STORAGE_KEY = 'adminToursCatalog';
const TOURS_CATALOG_UPDATED_EVENT = 'tours-catalog-updated';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

const defaultWeatherProfile = {
  baseTemp: 20,
  baseHumidity: 50,
  baseWind: 10,
  defaultCondition: 'Partly Cloudy',
};

let backendSyncPromise = null;

const IMAGE_OVERRIDES = {
  'orlando, fl|usa':
    'https://images.pexels.com/photos/34936498/pexels-photo-34936498.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'billund|denmark':
    'https://upload.wikimedia.org/wikipedia/commons/c/c4/Legoland_Billund_Denmark_2012.JPG',
  'gold coast|australia':
    'https://upload.wikimedia.org/wikipedia/commons/5/5e/Surfers_Paradise_Beach%2C_Gold_Coast%2C_Queensland%2C_Australia.jpg',
  'santorini|greece':
    'https://upload.wikimedia.org/wikipedia/commons/6/6d/Panoramic_view_of_Oia%2C_Santorini_island_%28Thira%29%2C_Greece.jpg',
  'baa atoll|maldives':
    'https://upload.wikimedia.org/wikipedia/commons/a/a5/Reethi_Beach_Maldives.jpg',
  'paris|france':
    'https://upload.wikimedia.org/wikipedia/commons/a/af/Tour_eiffel_at_sunrise_from_the_trocadero.jpg',
  'amalfi coast|italy':
    'https://upload.wikimedia.org/wikipedia/commons/1/12/Atrani_%28Costiera_Amalfitana%2C_23-8-2011%29.jpg',
  'ubud, bali|indonesia':
    'https://upload.wikimedia.org/wikipedia/commons/c/c7/Rice_terrace_Kadewatan_200507-1.jpg',
  'reykjavik|iceland':
    'https://upload.wikimedia.org/wikipedia/commons/b/b2/Bright_Lights_%284373695306%29.jpg',
  'reykjavík|iceland':
    'https://upload.wikimedia.org/wikipedia/commons/b/b2/Bright_Lights_%284373695306%29.jpg',
  'lofoten islands|norway':
    'https://upload.wikimedia.org/wikipedia/commons/3/30/Lofoten.landscapes1.jpg',
  'rome|italy':
    'https://upload.wikimedia.org/wikipedia/commons/5/53/Colosseum_in_Rome%2C_Italy_-_April_2007.jpg',
  'barcelona|spain':
    'https://upload.wikimedia.org/wikipedia/commons/0/0d/Sagrada_Familia_03.jpg',
  'cappadocia|turkey':
    'https://upload.wikimedia.org/wikipedia/commons/8/89/Cappadocia_Balloon_Inflating_Wikimedia_Commons.JPG',
  'giza/cairo|egypt':
    'https://upload.wikimedia.org/wikipedia/commons/a/af/All_Gizah_Pyramids.jpg',
};

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

const toSafeNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toOptionalNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const buildLocationKey = (destination, country) =>
  `${String(destination || '').trim().toLowerCase()}|${String(country || '').trim().toLowerCase()}`;

const buildFallbackPlan = (duration, destination = 'Destination') =>
  Array.from({ length: duration }, (_item, index) => `Day ${index + 1}: Explore ${destination}`);

const normalizePlan = (plan, duration, destination) => {
  const list = Array.isArray(plan)
    ? plan.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (list.length >= duration) {
    return list.slice(0, duration);
  }

  const fallback = buildFallbackPlan(duration, destination);
  return [...list, ...fallback.slice(list.length, duration)];
};

const normalizeWeatherProfile = (weatherProfile) => ({
  baseTemp: toSafeNumber(weatherProfile?.baseTemp, defaultWeatherProfile.baseTemp),
  baseHumidity: toSafeNumber(weatherProfile?.baseHumidity, defaultWeatherProfile.baseHumidity),
  baseWind: toSafeNumber(weatherProfile?.baseWind, defaultWeatherProfile.baseWind),
  defaultCondition: String(weatherProfile?.defaultCondition || defaultWeatherProfile.defaultCondition).trim(),
});

const normalizeTour = (tour, index = 0) => {
  const destination = String(tour?.destination || '').trim();
  const country = String(tour?.country || '').trim();
  const category = String(tour?.category || 'Adventure').trim();
  const duration = Math.max(1, toSafeNumber(tour?.duration, 5));
  const pricePerTraveler = toOptionalNumber(tour?.pricePerTraveler);
  const locationKey = buildLocationKey(destination, country);
  const imageOverride = IMAGE_OVERRIDES[locationKey];
  const existingId = tour?.id;
  const hasExistingId = existingId !== null && existingId !== undefined && String(existingId).trim() !== '';
  const id =
    (hasExistingId ? String(existingId) : null) ||
    `tour-${slugify(destination)}-${slugify(country)}-${String(index + 1).padStart(2, '0')}`;

  return {
    id,
    destination,
    country,
    category,
    description: String(tour?.description || '').trim(),
    duration,
    pricePerTraveler,
    img: imageOverride || String(tour?.img || '').trim(),
    slug: String(tour?.slug || '').trim(),
    plan: normalizePlan(tour?.plan, duration, destination),
    weatherProfile: normalizeWeatherProfile(tour?.weatherProfile),
  };
};

const normalizeTours = (list) =>
  Array.isArray(list) ? list.map((tour, index) => normalizeTour(tour, index)) : [];

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const parseStoredList = (rawValue) => {
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const emitToursUpdated = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(TOURS_CATALOG_UPDATED_EVENT));
};

const writeToursCatalog = (list) => {
  const normalized = normalizeTours(list);

  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    emitToursUpdated();
  }

  return normalized;
};

const parseJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const fetchToursFromBackend = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tours`);
    const payload = await parseJsonSafe(response);

    if (!response.ok || !Array.isArray(payload)) {
      return null;
    }

    return normalizeTours(payload);
  } catch {
    return null;
  }
};

export const getToursCatalog = () => {
  if (!canUseStorage()) {
    return [];
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return [];
  }

  const parsed = parseStoredList(storedValue);
  if (!parsed) {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }

  return normalizeTours(parsed);
};

const syncToursCatalogFromBackend = async ({ force = false } = {}) => {
  const cachedTours = getToursCatalog();
  if (!force && cachedTours.length > 0) {
    return cachedTours;
  }

  if (backendSyncPromise && !force) {
    return backendSyncPromise;
  }

  backendSyncPromise = (async () => {
    const backendTours = await fetchToursFromBackend();
    if (!backendTours) {
      return cachedTours;
    }

    return writeToursCatalog(backendTours);
  })();

  try {
    return await backendSyncPromise;
  } finally {
    backendSyncPromise = null;
  }
};

export const createTourInCatalog = (tourInput) => {
  const current = getToursCatalog();
  const created = normalizeTour(
    {
      ...tourInput,
      id: `tour-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    },
    current.length
  );

  writeToursCatalog([created, ...current]);
  return created;
};

export const updateTourInCatalog = (tourId, updates) => {
  const current = getToursCatalog();

  const updatedList = current.map((entry, index) =>
    entry.id === tourId
      ? normalizeTour(
          {
            ...entry,
            ...updates,
            id: entry.id,
            weatherProfile: {
              ...defaultWeatherProfile,
              ...(entry.weatherProfile || {}),
              ...(updates.weatherProfile || {}),
            },
          },
          index
        )
      : entry
  );

  writeToursCatalog(updatedList);
  return updatedList.find((entry) => entry.id === tourId) || null;
};

export const deleteTourFromCatalog = async (tourId, token) => {
  const normalizedTourId = String(tourId);
  const numericTourId = Number(normalizedTourId);
  const isBackendTourId = Number.isInteger(numericTourId) && numericTourId > 0;

  if (isBackendTourId) {
    const response = await fetch(`${API_BASE_URL}/api/admin/tours/${numericTourId}`, {
      method: 'DELETE',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    const payload = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error(payload?.message || 'Unable to delete tour.');
    }
  }

  const current = getToursCatalog();
  const updatedList = current.filter((entry) => String(entry.id) !== normalizedTourId);
  writeToursCatalog(updatedList);
  return updatedList;
};

export const useToursCatalog = () => {
  const [tours, setTours] = useState(() => getToursCatalog());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncTours = () => setTours(getToursCatalog());

    window.addEventListener(TOURS_CATALOG_UPDATED_EVENT, syncTours);
    window.addEventListener('storage', syncTours);

    let isActive = true;
    syncToursCatalogFromBackend().then((freshTours) => {
      if (isActive) {
        setTours(freshTours);
      }
    });

    return () => {
      isActive = false;
      window.removeEventListener(TOURS_CATALOG_UPDATED_EVENT, syncTours);
      window.removeEventListener('storage', syncTours);
    };
  }, []);

  return tours;
};
