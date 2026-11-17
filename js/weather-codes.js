/**
 * Weather Codes & Icon Mapping Module
 * Interprets WMO Weather interpretation codes (WW) from Open-Meteo
 * and provides responsive, crisp SVG icons.
 */

// Crisp SVG Icons Collection
const ICONS = {
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  
  cloudSun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-cloud-sun"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`,
  
  cloudMoon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-cloud-moon"><path d="M10.188 8.5A5.002 5.002 0 0 1 17 3a5.003 5.003 0 0 0-4.188 6.5"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`,
  
  cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-cloud"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  
  cloudDrizzle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-drizzle"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 19v1"/><path d="M8 14v1"/><path d="M16 19v1"/><path d="M16 14v1"/><path d="M12 21v1"/><path d="M12 16v1"/></svg>`,
  
  cloudRain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m16 14-2 6"/><path d="m8 14-2 6"/><path d="m12 16-2 6"/></svg>`,
  
  cloudRainHeavy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-heavy-rain"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m15 13-3 7"/><path d="m9 13-3 7"/><path d="m19 13-3 7"/><path d="m12 13-3 7"/></svg>`,
  
  cloudLightning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-thunder"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
  
  cloudSnow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-snow"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M8 15h.01"/><path d="M8 19h.01"/><path d="M12 17h.01"/><path d="M12 21h.01"/><path d="M16 15h.01"/><path d="M16 19h.01"/></svg>`,
  
  cloudFog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="weather-svg icon-fog"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 17H7"/><path d="M17 21H9"/></svg>`,
  
  wind: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  
  droplets: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.82-2.29 3.76S3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
  
  droplet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`,
  
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  
  gauge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>`,
  
  sunrise: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>`,
  
  sunset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10V4"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/></svg>`,
  
  thermometer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`,
  
  uv: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v1"/><path d="M12 20v1"/><path d="M3 12h1"/><path d="M20 12h1"/><path d="m18.364 5.636-.707.707"/><path d="m6.343 17.657-.707.707"/><path d="m5.636 5.636.707.707"/><path d="m17.657 17.657.707.707"/></svg>`,
  
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  
  mapPin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
  
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  
  starFilled: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`,
  
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`,
  
  chevronLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
  
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,

  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  
  navigation: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>`,

  crosshair: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>`,

  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>`,

  cloudRainDrop: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
};

/**
 * Maps WMO weather code to description, SVG icon, and background theme
 * @param {number} code - WMO weather code (0-99)
 * @param {boolean|number} isDay - 1 for day, 0 for night
 */
function getWeatherDetails(code, isDay = 1) {
  const day = Boolean(isDay);

  switch (code) {
    case 0:
      return {
        description: day ? 'Clear Sky' : 'Clear Night',
        icon: day ? ICONS.sun : ICONS.moon,
        iconName: day ? 'sun' : 'moon',
        theme: day ? 'theme-clear-day' : 'theme-clear-night',
        condition: 'Clear'
      };

    case 1:
      return {
        description: day ? 'Mainly Clear' : 'Mainly Clear Night',
        icon: day ? ICONS.sun : ICONS.moon,
        iconName: day ? 'sun' : 'moon',
        theme: day ? 'theme-clear-day' : 'theme-clear-night',
        condition: 'Clear'
      };

    case 2:
      return {
        description: 'Partly Cloudy',
        icon: day ? ICONS.cloudSun : ICONS.cloudMoon,
        iconName: day ? 'cloud-sun' : 'cloud-moon',
        theme: 'theme-clouds',
        condition: 'Partly Cloudy'
      };

    case 3:
      return {
        description: 'Overcast',
        icon: ICONS.cloud,
        iconName: 'cloud',
        theme: 'theme-clouds',
        condition: 'Overcast'
      };

    case 45:
      return {
        description: 'Foggy',
        icon: ICONS.cloudFog,
        iconName: 'cloud-fog',
        theme: 'theme-fog',
        condition: 'Fog'
      };

    case 48:
      return {
        description: 'Depositing Rime Fog',
        icon: ICONS.cloudFog,
        iconName: 'cloud-fog',
        theme: 'theme-fog',
        condition: 'Fog'
      };

    case 51:
      return {
        description: 'Light Drizzle',
        icon: ICONS.cloudDrizzle,
        iconName: 'cloud-drizzle',
        theme: 'theme-rain',
        condition: 'Drizzle'
      };

    case 53:
      return {
        description: 'Moderate Drizzle',
        icon: ICONS.cloudDrizzle,
        iconName: 'cloud-drizzle',
        theme: 'theme-rain',
        condition: 'Drizzle'
      };

    case 55:
      return {
        description: 'Dense Drizzle',
        icon: ICONS.cloudDrizzle,
        iconName: 'cloud-drizzle',
        theme: 'theme-rain',
        condition: 'Drizzle'
      };

    case 56:
    case 57:
      return {
        description: 'Freezing Drizzle',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Freezing Drizzle'
      };

    case 61:
      return {
        description: 'Slight Rain',
        icon: ICONS.cloudRain,
        iconName: 'cloud-rain',
        theme: 'theme-rain',
        condition: 'Rain'
      };

    case 63:
      return {
        description: 'Moderate Rain',
        icon: ICONS.cloudRain,
        iconName: 'cloud-rain',
        theme: 'theme-rain',
        condition: 'Rain'
      };

    case 65:
      return {
        description: 'Heavy Rain',
        icon: ICONS.cloudRainHeavy,
        iconName: 'cloud-rain-heavy',
        theme: 'theme-rain',
        condition: 'Heavy Rain'
      };

    case 66:
    case 67:
      return {
        description: 'Freezing Rain',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Freezing Rain'
      };

    case 71:
      return {
        description: 'Slight Snowfall',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Snow'
      };

    case 73:
      return {
        description: 'Moderate Snowfall',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Snow'
      };

    case 75:
      return {
        description: 'Heavy Snowfall',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Heavy Snow'
      };

    case 77:
      return {
        description: 'Snow Grains',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Snow'
      };

    case 80:
      return {
        description: 'Slight Rain Showers',
        icon: ICONS.cloudRain,
        iconName: 'cloud-rain',
        theme: 'theme-rain',
        condition: 'Showers'
      };

    case 81:
      return {
        description: 'Moderate Rain Showers',
        icon: ICONS.cloudRain,
        iconName: 'cloud-rain',
        theme: 'theme-rain',
        condition: 'Showers'
      };

    case 82:
      return {
        description: 'Violent Rain Showers',
        icon: ICONS.cloudRainHeavy,
        iconName: 'cloud-rain-heavy',
        theme: 'theme-rain',
        condition: 'Violent Rain'
      };

    case 85:
      return {
        description: 'Slight Snow Showers',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Snow Showers'
      };

    case 86:
      return {
        description: 'Heavy Snow Showers',
        icon: ICONS.cloudSnow,
        iconName: 'cloud-snow',
        theme: 'theme-snow',
        condition: 'Heavy Snow'
      };

    case 95:
      return {
        description: 'Thunderstorm',
        icon: ICONS.cloudLightning,
        iconName: 'cloud-lightning',
        theme: 'theme-thunder',
        condition: 'Thunderstorm'
      };

    case 96:
    case 99:
      return {
        description: 'Thunderstorm with Hail',
        icon: ICONS.cloudLightning,
        iconName: 'cloud-lightning',
        theme: 'theme-thunder',
        condition: 'Hail Storm'
      };

    default:
      return {
        description: 'Clear Sky',
        icon: day ? ICONS.sun : ICONS.moon,
        iconName: day ? 'sun' : 'moon',
        theme: day ? 'theme-clear-day' : 'theme-clear-night',
        condition: 'Clear'
      };
  }
}

/**
 * Returns compass direction abbreviation and degrees
 * @param {number} degrees - Wind direction in degrees (0-360)
 */
function getWindDirection(degrees) {
  const directions = [
    'N', 'NNE', 'NE', 'ENE', 
    'E', 'ESE', 'SE', 'SSE', 
    'S', 'SSW', 'SW', 'WSW', 
    'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return {
    abbr: directions[index],
    degrees: Math.round(degrees)
  };
}

/**
 * Returns UV index category, color badge class, and sun protection advice
 * @param {number} uv - UV index number
 */
function getUvCategory(uv) {
  const val = Number(uv) || 0;
  if (val <= 2) {
    return {
      level: 'Low',
      category: 'uv-low',
      advice: 'Minimal sun protection needed. Safe for outdoor activities.'
    };
  } else if (val <= 5) {
    return {
      level: 'Moderate',
      category: 'uv-moderate',
      advice: 'Wear sunglasses & SPF 30+ sunscreen if outdoors.'
    };
  } else if (val <= 7) {
    return {
      level: 'High',
      category: 'uv-high',
      advice: 'Reduce time in direct sun between 10 AM - 4 PM. Wear a hat.'
    };
  } else if (val <= 10) {
    return {
      level: 'Very High',
      category: 'uv-very-high',
      advice: 'Extra protection essential. Seek shade during peak hours.'
    };
  } else {
    return {
      level: 'Extreme',
      category: 'uv-extreme',
      advice: 'Dangerous sun levels. Avoid direct outdoor exposure.'
    };
  }
}

/**
 * Converts country code to unicode emoji flag
 * @param {string} code - Two-letter ISO country code
 */
function getCountryFlag(code) {
  if (!code || code.length !== 2) return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Format visibility distance in km or miles
 * @param {number} meters - Visibility in meters
 * @param {boolean} isImperial - Whether to display in miles
 */
function formatVisibility(meters, isImperial = false) {
  if (meters === null || meters === undefined || isNaN(meters)) return { value: '--', label: 'Visibility' };
  if (isImperial) {
    const miles = (meters / 1609.34).toFixed(1);
    return { value: `${miles} mi`, label: meters >= 10000 ? 'Clear visibility' : 'Reduced visibility' };
  } else {
    const km = (meters / 1000).toFixed(1);
    return { value: `${km} km`, label: meters >= 10000 ? 'Clear visibility' : 'Reduced visibility' };
  }
}

/**
 * Returns air pressure assessment
 * @param {number} hPa - Surface pressure in hPa
 */
function getPressureStatus(hPa) {
  if (!hPa) return { label: 'Normal', note: 'Standard pressure' };
  if (hPa > 1020) return { label: 'High', note: 'Clear stable weather' };
  if (hPa < 1005) return { label: 'Low', note: 'Possible unsettled weather' };
  return { label: 'Normal', note: 'Stable conditions' };
}

/**
 * Returns humidity assessment
 * @param {number} percent - Humidity percentage
 */
function getHumidityStatus(percent) {
  if (percent < 30) return { label: 'Dry', note: 'Low moisture level' };
  if (percent <= 60) return { label: 'Comfortable', note: 'Optimal humidity level' };
  if (percent <= 80) return { label: 'Humid', note: 'High moisture level' };
  return { label: 'Very Humid', note: 'Muggy and damp air' };
}
