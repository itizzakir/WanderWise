const CATEGORY_BASE_FARE = {
  Family: 72000,
  Couple: 98000,
  Adventure: 112000,
  Culture: 86000,
};

const CATEGORY_DAY_RATE = {
  Family: 8500,
  Couple: 11000,
  Adventure: 13000,
  Culture: 9500,
};

const hashString = (value = '') => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const roundToNearest = (value, nearest = 500) =>
  Math.max(nearest, Math.round(value / nearest) * nearest);

const toPositiveNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

export const getTourPricePerTraveler = (tour = {}) => {
  const explicitPrice = toPositiveNumber(tour.pricePerTraveler);
  if (explicitPrice) {
    return roundToNearest(explicitPrice, 500);
  }

  const category = String(tour.category || 'Adventure');
  const base = CATEGORY_BASE_FARE[category] || 90000;
  const perDay = CATEGORY_DAY_RATE[category] || 10000;
  const duration = Math.max(3, Number(tour.duration) || 5);
  const destinationKey = `${tour.destination || ''}-${tour.country || ''}`;
  const seasonalityPremium = hashString(destinationKey) % 28000;
  const durationPremium = Math.max(0, duration - 3) * perDay;

  return roundToNearest(base + durationPremium + seasonalityPremium, 500);
};

export const formatInr = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
