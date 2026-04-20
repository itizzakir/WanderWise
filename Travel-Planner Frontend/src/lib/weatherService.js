// Mock Weather Service
// Returns mock data based on weather profiles in the tours catalog.

import { getToursCatalog } from './toursCatalog';

const weatherConditions = [
  { condition: 'Sunny', icon: '☀️' },
  { condition: 'Cloudy', icon: '☁️' },
  { condition: 'Partly Cloudy', icon: '⛅' },
  { condition: 'Rainy', icon: '🌧️' },
  { condition: 'Stormy', icon: '⛈️' },
  { condition: 'Windy', icon: '💨' },
  { condition: 'Snowy', icon: '❄️' },
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

// Get temp first so we can pick a matching condition
const getTemp = (val, baseTemp) => {
  // Variation between -4 and +4 from base
  return baseTemp + (val % 9) - 4;
};

/**
 * Selects a weather condition that is realistic for the given temperature.
 * @param {number} val - Hash value for randomness
 * @param {number} temp - The calculated temperature
 * @param {string} defaultCondName - The default condition from the tour profile
 */
const getCondition = (val, temp, defaultCondName) => {
  // 1. Filter conditions based on realism
  let validConditions = [...weatherConditions];

  if (temp > 4) {
    // If it's warm (> 4°C), remove Snow
    validConditions = validConditions.filter((c) => c.condition !== 'Snowy');
  } else {
    // If it's cold (<= 4°C), remove Rain/Storm (assume it becomes Snow)
    validConditions = validConditions.filter(
      (c) => !['Rainy', 'Stormy'].includes(c.condition)
    );
  }

  // 2. Try to use the default profile condition if it's valid for this temp
  if (defaultCondName) {
    const defaultObj = validConditions.find(
      (c) => c.condition === defaultCondName
    );
    // 70% chance to stick to the profile default if it's realistic
    if (defaultObj && val % 10 > 2) {
      return defaultObj;
    }
  }

  // 3. Fallback: Select purely based on hash from the VALID list
  return validConditions[Math.abs(val) % validConditions.length];
};

export const getWeather = (destination, weatherProfileOverride = null) => {
  const hash = getHash(destination);
  const tours = getToursCatalog();

  // Find the tour data to get the specific weather profile
  const tour = tours.find((t) => t.destination === destination);

  // Default fallback if tour not found
  const profile = weatherProfileOverride || tour?.weatherProfile || {
    baseTemp: 20,
    baseHumidity: 50,
    baseWind: 10,
    defaultCondition: 'Partly Cloudy',
  };

  // Calculate Current Temp FIRST
  const currentTemp = getTemp(hash, profile.baseTemp);

  const current = {
    temp: currentTemp,
    // Pass temp to getCondition so the icon matches
    ...getCondition(hash, currentTemp, profile.defaultCondition),
    humidity: Math.min(
      100,
      Math.max(0, profile.baseHumidity + ((hash % 10) - 5))
    ),
    windSpeed: Math.max(0, profile.baseWind + ((hash % 10) - 5)),
  };

  const forecast = [];
  const today = new Date().getDay();

  for (let i = 1; i <= 5; i++) {
    const dayHash = getHash(destination + i + 'forecast');
    const dayIndex = (today + i) % 7;

    // Calculate Forecast Temp FIRST
    const dayTemp = getTemp(dayHash, profile.baseTemp);

    forecast.push({
      day: days[dayIndex],
      temp: dayTemp,
      // Pass temp to getCondition
      ...getCondition(dayHash, dayTemp, profile.defaultCondition),
    });
  }

  return { current, forecast, location: destination };
};
