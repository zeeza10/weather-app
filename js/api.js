/**
 * Weather API Client
 * Interfaces with Open-Meteo free APIs and reverse-geocoding services.
 */

const WeatherAPI = (() => {
  const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  const FORECAST_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
  const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

  // In-memory cache to prevent redundant requests
  const cache = new Map();
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Helper fetch with timeout
   */
  async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(id);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.');
      }
      throw err;
    }
  }

  /**
   * Search cities by name using Open-Meteo Geocoding API
   * @param {string} query - City name to search
   * @param {number} count - Max results (default 6)
   * @returns {Promise<Array>} List of city matches
   */
  async function searchCities(query, count = 6) {
    const trimmed = (query || '').trim();
    if (trimmed.length < 2) return [];

    const cacheKey = `geo_${trimmed.toLowerCase()}_${count}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(trimmed)}&count=${count}&language=en&format=json`;
    
    try {
      const data = await fetchWithTimeout(url);
      const results = (data.results || []).map(item => ({
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country || '',
        countryCode: item.country_code || '',
        admin1: item.admin1 || '', // State / province / region
        timezone: item.timezone || 'auto',
        displayName: [item.name, item.admin1, item.country].filter(Boolean).join(', ')
      }));

      cache.set(cacheKey, { timestamp: Date.now(), data: results });
      return results;
    } catch (err) {
      console.error('Error searching cities:', err);
      throw new Error(`Unable to search cities: ${err.message}`);
    }
  }

  /**
   * Fetches comprehensive weather forecast data for coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} timezone - Timezone identifier or 'auto'
   */
  async function getForecast(lat, lon, timezone = 'auto') {
    const latRounded = Number(lat).toFixed(4);
    const lonRounded = Number(lon).toFixed(4);
    const cacheKey = `forecast_${latRounded}_${lonRounded}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    const currentParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m'
    ].join(',');

    const hourlyParams = [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'visibility',
      'wind_speed_10m',
      'uv_index'
    ].join(',');

    const dailyParams = [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max'
    ].join(',');

    const url = `${FORECAST_BASE_URL}?latitude=${latRounded}&longitude=${lonRounded}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=${encodeURIComponent(timezone || 'auto')}`;

    try {
      const data = await fetchWithTimeout(url);
      cache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    } catch (err) {
      console.error('Error fetching weather forecast:', err);
      throw new Error(`Unable to fetch weather forecast: ${err.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to obtain city and country name
   * Uses BigDataCloud with OpenStreetMap Nominatim fallback
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async function reverseGeocode(lat, lon) {
    try {
      const url = `${REVERSE_GEOCODE_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      const data = await fetchWithTimeout(url, {}, 5000);
      
      const cityName = data.city || data.locality || data.principalSubdivision || 'Current Location';
      const admin1 = (data.principalSubdivision && data.principalSubdivision !== cityName) ? data.principalSubdivision : '';
      const country = data.countryName || '';
      const countryCode = data.countryCode || '';

      return {
        name: cityName,
        admin1: admin1,
        country: country,
        countryCode: countryCode,
        latitude: lat,
        longitude: lon,
        displayName: [cityName, admin1, country].filter(Boolean).join(', ')
      };
    } catch (primaryErr) {
      console.warn('Primary reverse geocode failed, trying fallback...', primaryErr);
      try {
        const fallbackUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const fallbackData = await fetchWithTimeout(fallbackUrl, {
          headers: { 'User-Agent': 'ModernWeatherApp/1.0' }
        }, 5000);
        
        const addr = fallbackData.address || {};
        const cityName = addr.city || addr.town || addr.village || addr.municipality || 'Current Location';
        const admin1 = addr.state || addr.region || '';
        const country = addr.country || '';
        const countryCode = (addr.country_code || '').toUpperCase();

        return {
          name: cityName,
          admin1: admin1,
          country: country,
          countryCode: countryCode,
          latitude: lat,
          longitude: lon,
          displayName: [cityName, admin1, country].filter(Boolean).join(', ')
        };
      } catch (fallbackErr) {
        console.warn('Fallback reverse geocode also failed:', fallbackErr);
        return {
          name: 'My Location',
          admin1: '',
          country: '',
          countryCode: '',
          latitude: lat,
          longitude: lon,
          displayName: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
        };
      }
    }
  }

  /**
   * Helper temperature conversion: C to F
   */
  function celsiusToFahrenheit(c) {
    if (c === null || c === undefined || isNaN(c)) return null;
    return (c * 9) / 5 + 32;
  }

  /**
   * Helper wind speed conversion: km/h to mph
   */
  function kmhToMph(kmh) {
    if (kmh === null || kmh === undefined || isNaN(kmh)) return null;
    return kmh * 0.621371;
  }

  /**
   * Helper precipitation conversion: mm to inches
   */
  function mmToInches(mm) {
    if (mm === null || mm === undefined || isNaN(mm)) return null;
    return mm * 0.0393701;
  }

  /**
   * Clear cache manually
   */
  function clearCache() {
    cache.clear();
  }

  return {
    searchCities,
    getForecast,
    reverseGeocode,
    celsiusToFahrenheit,
    kmhToMph,
    mmToInches,
    clearCache
  };
})();
