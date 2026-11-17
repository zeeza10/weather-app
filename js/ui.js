/**
 * UI Rendering and DOM Operations Module
 */

const WeatherUI = (() => {
  // DOM Element References
  const elements = {
    app: document.getElementById('app'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    unitToggleBtn: document.getElementById('unit-toggle-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    locateBtn: document.getElementById('locate-btn'),
    favoritesBtn: document.getElementById('favorites-btn'),
    favoriteStarBtn: document.getElementById('favorite-star-btn'),
    
    // Search
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    searchSuggestions: document.getElementById('search-suggestions'),
    recentSearchesList: document.getElementById('recent-searches-list'),
    recentSearchesSection: document.getElementById('recent-searches-section'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),

    // Favorites Modal
    favoritesModal: document.getElementById('favorites-modal'),
    favoritesList: document.getElementById('favorites-list'),
    closeFavoritesModalBtn: document.getElementById('close-favorites-modal-btn'),

    // Weather Sections
    weatherContent: document.getElementById('weather-content'),
    skeletonLoader: document.getElementById('skeleton-loader'),
    errorMessage: document.getElementById('error-message'),
    errorText: document.getElementById('error-text'),
    retryBtn: document.getElementById('retry-btn'),

    // Current Weather Elements
    cityName: document.getElementById('city-name'),
    locationCountry: document.getElementById('location-country'),
    localTime: document.getElementById('local-time'),
    lastUpdatedTime: document.getElementById('last-updated-time'),
    currentTemp: document.getElementById('current-temp'),
    tempUnitLabel: document.getElementById('temp-unit-label'),
    weatherCondition: document.getElementById('weather-condition'),
    feelsLikeTemp: document.getElementById('feels-like-temp'),
    tempHigh: document.getElementById('temp-high'),
    tempLow: document.getElementById('temp-low'),
    currentWeatherIconContainer: document.getElementById('current-weather-icon-container'),

    // Highlights
    windSpeed: document.getElementById('wind-speed'),
    windUnit: document.getElementById('wind-unit'),
    windDirectionText: document.getElementById('wind-direction-text'),
    windCompassArrow: document.getElementById('wind-compass-arrow'),
    windGust: document.getElementById('wind-gust'),
    
    humidityValue: document.getElementById('humidity-value'),
    humidityStatus: document.getElementById('humidity-status'),
    humidityBar: document.getElementById('humidity-bar'),

    uvValue: document.getElementById('uv-value'),
    uvBadge: document.getElementById('uv-badge'),
    uvAdvice: document.getElementById('uv-advice'),
    uvProgressBar: document.getElementById('uv-progress-bar'),

    sunriseTime: document.getElementById('sunrise-time'),
    sunsetTime: document.getElementById('sunset-time'),
    daylightDuration: document.getElementById('daylight-duration'),
    daylightProgressBar: document.getElementById('daylight-progress-bar'),

    pressureValue: document.getElementById('pressure-value'),
    pressureStatus: document.getElementById('pressure-status'),

    visibilityValue: document.getElementById('visibility-value'),
    visibilityStatus: document.getElementById('visibility-status'),

    precipitationValue: document.getElementById('precipitation-value'),
    precipitationProbability: document.getElementById('precipitation-probability'),

    // Forecasts
    hourlyForecastContainer: document.getElementById('hourly-forecast-container'),
    hourlyScrollLeftBtn: document.getElementById('hourly-scroll-left'),
    hourlyScrollRightBtn: document.getElementById('hourly-scroll-right'),
    dailyForecastContainer: document.getElementById('daily-forecast-container'),

    // Toast Container
    toastContainer: document.getElementById('toast-container')
  };

  /**
   * Format temperature according to active unit
   */
  function formatTemp(celsius, unit = 'C', includeDegree = true) {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
    const val = unit === 'F' ? WeatherAPI.celsiusToFahrenheit(celsius) : celsius;
    const rounded = Math.round(val);
    return includeDegree ? `${rounded}°` : `${rounded}`;
  }

  /**
   * Format wind speed according to active unit
   */
  function formatWindSpeed(kmh, unit = 'C') {
    if (kmh === null || kmh === undefined || isNaN(kmh)) return { value: '--', unit: unit === 'F' ? 'mph' : 'km/h' };
    if (unit === 'F') {
      const mph = WeatherAPI.kmhToMph(kmh);
      return { value: Math.round(mph), unit: 'mph' };
    }
    return { value: Math.round(kmh), unit: 'km/h' };
  }

  /**
   * Format precipitation amount
   */
  function formatPrecipitation(mm, unit = 'C') {
    if (mm === null || mm === undefined || isNaN(mm)) return { value: '0', unit: unit === 'F' ? 'in' : 'mm' };
    if (unit === 'F') {
      const inches = WeatherAPI.mmToInches(mm);
      return { value: inches < 0.1 && inches > 0 ? inches.toFixed(2) : inches.toFixed(1), unit: 'in' };
    }
    return { value: mm.toFixed(1), unit: 'mm' };
  }

  /**
   * Format local date and time using city timezone
   */
  function formatLocalDateTime(timezoneStr) {
    const now = new Date();
    try {
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneStr || undefined,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneStr || undefined,
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return {
        time: timeFormatter.format(now),
        date: dateFormatter.format(now)
      };
    } catch {
      return {
        time: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        date: now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      };
    }
  }

  /**
   * Parse ISO hour string to 12-hour label (e.g. "12 PM")
   */
  function formatHourLabel(isoString, timezoneStr) {
    const d = new Date(isoString);
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneStr || undefined,
        hour: 'numeric',
        hour12: true
      }).format(d);
    } catch {
      return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    }
  }

  /**
   * Parse ISO day string to weekday and date
   */
  function formatDayLabel(isoString, index, timezoneStr) {
    if (index === 0) return { day: 'Today', date: 'Today' };
    if (index === 1) return { day: 'Tomorrow', date: 'Tomorrow' };
    
    // Parse YYYY-MM-DD
    const parts = isoString.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    
    const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return {
      day: dayFormatter.format(d),
      date: dateFormatter.format(d)
    };
  }

  /**
   * Format sunrise/sunset ISO time
   */
  function formatSunTime(isoString, timezoneStr) {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timezoneStr || undefined,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(d);
    } catch {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  }

  /**
   * Calculate daylight duration and elapsed percentage
   */
  function calculateDaylight(sunriseIso, sunsetIso, timezoneStr) {
    if (!sunriseIso || !sunsetIso) return { duration: '--', percent: 0 };
    const sunrise = new Date(sunriseIso).getTime();
    const sunset = new Date(sunsetIso).getTime();
    const now = Date.now();

    const totalMs = sunset - sunrise;
    if (totalMs <= 0) return { duration: '--', percent: 0 };

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const mins = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    let percent = 0;
    if (now <= sunrise) {
      percent = 0;
    } else if (now >= sunset) {
      percent = 100;
    } else {
      percent = Math.min(100, Math.max(0, Math.round(((now - sunrise) / totalMs) * 100)));
    }

    return {
      duration: `${hours}h ${mins}m`,
      percent: percent
    };
  }

  /**
   * Update theme attribute and icon
   */
  function updateTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (elements.themeIcon) {
      elements.themeIcon.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
    }
  }

  /**
   * Update unit button display
   */
  function updateUnitToggle(unit) {
    if (elements.unitToggleBtn) {
      elements.unitToggleBtn.innerHTML = `
        <span class="unit-option ${unit === 'C' ? 'active' : ''}">°C</span>
        <span class="unit-divider">/</span>
        <span class="unit-option ${unit === 'F' ? 'active' : ''}">°F</span>
      `;
    }
    if (elements.tempUnitLabel) {
      elements.tempUnitLabel.textContent = `°${unit}`;
    }
  }

  /**
   * Show Toast Notification
   */
  function showToast(message, type = 'info', durationMs = 3500) {
    if (!elements.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;
    
    let icon = ICONS.compass;
    if (type === 'success') icon = ICONS.starFilled;
    if (type === 'error') icon = ICONS.close;
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close-btn" aria-label="Close notification">${ICONS.close}</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    });

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.isConnected) {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
      }
    }, durationMs);
  }

  /**
   * Toggle loading skeleton
   */
  function setLoading(isLoading) {
    if (elements.refreshBtn) {
      if (isLoading) {
        elements.refreshBtn.classList.add('spinning');
        elements.refreshBtn.setAttribute('disabled', 'true');
      } else {
        elements.refreshBtn.classList.remove('spinning');
        elements.refreshBtn.removeAttribute('disabled');
      }
    }

    if (elements.skeletonLoader && elements.weatherContent) {
      if (isLoading) {
        elements.skeletonLoader.classList.remove('hidden');
        elements.weatherContent.classList.add('loading-fade');
        elements.errorMessage.classList.add('hidden');
      } else {
        elements.skeletonLoader.classList.add('hidden');
        elements.weatherContent.classList.remove('loading-fade');
      }
    }
  }

  /**
   * Display Error State
   */
  function showError(msg) {
    if (elements.errorMessage && elements.errorText) {
      elements.errorText.textContent = msg || 'Unable to retrieve weather data. Please try again.';
      elements.errorMessage.classList.remove('hidden');
      if (elements.skeletonLoader) elements.skeletonLoader.classList.add('hidden');
    }
    showToast(msg, 'error');
  }

  /**
   * Hide Error State
   */
  function hideError() {
    if (elements.errorMessage) {
      elements.errorMessage.classList.add('hidden');
    }
  }

  /**
   * Apply dynamic weather background theme class
   */
  function setWeatherTheme(themeClass) {
    const validThemes = [
      'theme-clear-day',
      'theme-clear-night',
      'theme-clouds',
      'theme-rain',
      'theme-thunder',
      'theme-snow',
      'theme-fog'
    ];
    document.body.classList.remove(...validThemes);
    if (themeClass) {
      document.body.classList.add(themeClass);
    }
  }

  /**
   * Render Current Weather Section
   */
  function renderCurrentWeather(city, weatherData, unit, isFavorite) {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const timezone = weatherData.timezone || city.timezone || 'auto';

    const weatherDetails = getWeatherDetails(current.weather_code, current.is_day);
    setWeatherTheme(weatherDetails.theme);

    // City & Country Header
    elements.cityName.textContent = city.name;
    const flag = getCountryFlag(city.countryCode);
    const regionParts = [city.admin1, city.country].filter(Boolean).join(', ');
    elements.locationCountry.innerHTML = `<span class="flag-icon">${flag}</span> <span>${regionParts}</span>`;

    // Local time & last updated
    const local = formatLocalDateTime(timezone);
    elements.localTime.textContent = `${local.date} • ${local.time}`;
    elements.lastUpdatedTime.textContent = `Updated just now`;

    // Temperature & Conditions
    elements.currentTemp.textContent = formatTemp(current.temperature_2m, unit, false);
    elements.tempUnitLabel.textContent = `°${unit}`;
    elements.weatherCondition.textContent = weatherDetails.description;
    elements.feelsLikeTemp.textContent = formatTemp(current.apparent_temperature, unit);

    if (daily && daily.temperature_2m_max && daily.temperature_2m_max.length > 0) {
      elements.tempHigh.textContent = formatTemp(daily.temperature_2m_max[0], unit);
      elements.tempLow.textContent = formatTemp(daily.temperature_2m_min[0], unit);
    }

    // Weather Icon
    elements.currentWeatherIconContainer.innerHTML = weatherDetails.icon;

    // Favorite button state
    if (elements.favoriteStarBtn) {
      elements.favoriteStarBtn.innerHTML = isFavorite ? ICONS.starFilled : ICONS.star;
      elements.favoriteStarBtn.classList.toggle('active', isFavorite);
      elements.favoriteStarBtn.setAttribute('title', isFavorite ? 'Remove from favorites' : 'Save to favorites');
    }
  }

  /**
   * Render Weather Highlights Section
   */
  function renderHighlights(weatherData, unit) {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const hourly = weatherData.hourly;
    const timezone = weatherData.timezone;

    // 1. Wind & Compass
    const windInfo = formatWindSpeed(current.wind_speed_10m, unit);
    elements.windSpeed.textContent = windInfo.value;
    elements.windUnit.textContent = windInfo.unit;

    const windDir = getWindDirection(current.wind_direction_10m);
    elements.windDirectionText.textContent = `${windDir.abbr} (${windDir.degrees}°)`;
    if (elements.windCompassArrow) {
      elements.windCompassArrow.style.transform = `rotate(${windDir.degrees}deg)`;
    }

    if (daily && daily.wind_speed_10m_max && daily.wind_speed_10m_max.length > 0) {
      const gustInfo = formatWindSpeed(daily.wind_speed_10m_max[0], unit);
      elements.windGust.textContent = `Max gust today: ${gustInfo.value} ${gustInfo.unit}`;
    }

    // 2. Humidity
    const humidity = Math.round(current.relative_humidity_2m);
    elements.humidityValue.textContent = `${humidity}%`;
    const humStatus = getHumidityStatus(humidity);
    elements.humidityStatus.textContent = `${humStatus.label} • ${humStatus.note}`;
    if (elements.humidityBar) {
      elements.humidityBar.style.width = `${humidity}%`;
    }

    // 3. UV Index
    const uvMax = (daily && daily.uv_index_max && daily.uv_index_max.length > 0) ? daily.uv_index_max[0] : 0;
    const uvInfo = getUvCategory(uvMax);
    elements.uvValue.textContent = uvMax !== null ? uvMax.toFixed(1) : '--';
    elements.uvBadge.textContent = uvInfo.level;
    elements.uvBadge.className = `badge ${uvInfo.category}`;
    elements.uvAdvice.textContent = uvInfo.advice;
    if (elements.uvProgressBar) {
      const uvPercent = Math.min(100, Math.round((uvMax / 11) * 100));
      elements.uvProgressBar.style.width = `${uvPercent}%`;
    }

    // 4. Sunrise & Sunset
    if (daily && daily.sunrise && daily.sunrise.length > 0) {
      const sunriseStr = daily.sunrise[0];
      const sunsetStr = daily.sunset[0];
      elements.sunriseTime.textContent = formatSunTime(sunriseStr, timezone);
      elements.sunsetTime.textContent = formatSunTime(sunsetStr, timezone);

      const daylight = calculateDaylight(sunriseStr, sunsetStr, timezone);
      elements.daylightDuration.textContent = `Daylight: ${daylight.duration}`;
      if (elements.daylightProgressBar) {
        elements.daylightProgressBar.style.width = `${daylight.percent}%`;
      }
    }

    // 5. Atmospheric Pressure
    const pressure = Math.round(current.surface_pressure);
    elements.pressureValue.textContent = `${pressure} hPa`;
    const pressStatus = getPressureStatus(pressure);
    elements.pressureStatus.textContent = `${pressStatus.label} • ${pressStatus.note}`;

    // 6. Visibility
    let currentVisibility = null;
    if (hourly && hourly.visibility && hourly.visibility.length > 0) {
      // Find current hour visibility or first available
      currentVisibility = hourly.visibility[0];
    }
    const visInfo = formatVisibility(currentVisibility, unit === 'F');
    elements.visibilityValue.textContent = visInfo.value;
    elements.visibilityStatus.textContent = visInfo.label;

    // 7. Precipitation
    let precipToday = 0;
    let rainChanceMax = 0;
    if (daily && daily.precipitation_sum && daily.precipitation_sum.length > 0) {
      precipToday = daily.precipitation_sum[0];
    }
    if (daily && daily.precipitation_probability_max && daily.precipitation_probability_max.length > 0) {
      rainChanceMax = daily.precipitation_probability_max[0];
    }
    const precipFormatted = formatPrecipitation(precipToday, unit);
    elements.precipitationValue.textContent = `${precipFormatted.value} ${precipFormatted.unit}`;
    elements.precipitationProbability.textContent = `${rainChanceMax}% max probability today`;
  }

  /**
   * Render Next 24 Hours Forecast
   */
  function renderHourlyForecast(weatherData, unit) {
    if (!elements.hourlyForecastContainer) return;
    const hourly = weatherData.hourly;
    if (!hourly || !hourly.time) return;

    elements.hourlyForecastContainer.innerHTML = '';

    const timezone = weatherData.timezone;
    const currentTimeStr = weatherData.current.time;
    
    // Find index matching current time or closest past hour
    let startIndex = 0;
    if (currentTimeStr) {
      const targetTime = new Date(currentTimeStr).getTime();
      let minDiff = Infinity;
      hourly.time.forEach((t, i) => {
        const diff = Math.abs(new Date(t).getTime() - targetTime);
        if (diff < minDiff) {
          minDiff = diff;
          startIndex = i;
        }
      });
    }

    const next24Hours = hourly.time.slice(startIndex, startIndex + 24);

    next24Hours.forEach((timeStr, idx) => {
      const realIdx = startIndex + idx;
      const isFirst = idx === 0;
      const timeLabel = isFirst ? 'Now' : formatHourLabel(timeStr, timezone);
      
      const temp = hourly.temperature_2m[realIdx];
      const code = hourly.weather_code[realIdx];
      const rainProb = (hourly.precipitation_probability && hourly.precipitation_probability[realIdx] !== undefined)
        ? hourly.precipitation_probability[realIdx]
        : 0;
      const windSpd = (hourly.wind_speed_10m && hourly.wind_speed_10m[realIdx] !== undefined)
        ? hourly.wind_speed_10m[realIdx]
        : 0;

      // Determine day/night based on hour (roughly 6 AM to 8 PM)
      const hourNum = new Date(timeStr).getHours();
      const isDayHour = hourNum >= 6 && hourNum < 20 ? 1 : 0;
      const weatherDet = getWeatherDetails(code, isDayHour);
      const windFormatted = formatWindSpeed(windSpd, unit);

      const card = document.createElement('div');
      card.className = `hourly-card ${isFirst ? 'current-hour' : ''}`;
      card.innerHTML = `
        <span class="hourly-time">${timeLabel}</span>
        <div class="hourly-icon">${weatherDet.icon}</div>
        <span class="hourly-temp">${formatTemp(temp, unit)}</span>
        <div class="hourly-rain-pill ${rainProb > 20 ? 'has-rain' : ''}" title="${rainProb}% chance of rain">
          ${ICONS.droplet}
          <span>${rainProb}%</span>
        </div>
        <span class="hourly-wind">${windFormatted.value} ${windFormatted.unit}</span>
      `;

      elements.hourlyForecastContainer.appendChild(card);
    });
  }

  /**
   * Render 7-Day Forecast Section with visual temperature spectrum bars
   */
  function renderDailyForecast(weatherData, unit) {
    if (!elements.dailyForecastContainer) return;
    const daily = weatherData.daily;
    if (!daily || !daily.time) return;

    elements.dailyForecastContainer.innerHTML = '';

    const timezone = weatherData.timezone;
    const daysCount = Math.min(daily.time.length, 7);

    // Calculate week's absolute min and max for relative temperature bar
    let weekMin = Infinity;
    let weekMax = -Infinity;
    for (let i = 0; i < daysCount; i++) {
      if (daily.temperature_2m_min[i] < weekMin) weekMin = daily.temperature_2m_min[i];
      if (daily.temperature_2m_max[i] > weekMax) weekMax = daily.temperature_2m_max[i];
    }
    const tempRange = Math.max(1, weekMax - weekMin);

    for (let i = 0; i < daysCount; i++) {
      const timeStr = daily.time[i];
      const dayInfo = formatDayLabel(timeStr, i, timezone);
      const code = daily.weather_code[i];
      const weatherDet = getWeatherDetails(code, 1);
      
      const minTemp = daily.temperature_2m_min[i];
      const maxTemp = daily.temperature_2m_max[i];
      const rainProb = (daily.precipitation_probability_max && daily.precipitation_probability_max[i] !== undefined)
        ? daily.precipitation_probability_max[i]
        : 0;
      
      // Calculate bar offsets relative to week range
      const leftOffset = Math.round(((minTemp - weekMin) / tempRange) * 100);
      const barWidth = Math.max(8, Math.round(((maxTemp - minTemp) / tempRange) * 100));

      const uvMax = (daily.uv_index_max && daily.uv_index_max[i]) || 0;
      const windMax = (daily.wind_speed_10m_max && daily.wind_speed_10m_max[i]) || 0;
      const precipSum = (daily.precipitation_sum && daily.precipitation_sum[i]) || 0;
      const sunriseStr = daily.sunrise ? daily.sunrise[i] : null;
      const sunsetStr = daily.sunset ? daily.sunset[i] : null;

      const row = document.createElement('div');
      row.className = 'daily-row';
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute('aria-expanded', 'false');

      row.innerHTML = `
        <div class="daily-main">
          <div class="daily-day-col">
            <span class="daily-day">${dayInfo.day}</span>
            <span class="daily-date">${dayInfo.date}</span>
          </div>

          <div class="daily-condition-col">
            <div class="daily-icon">${weatherDet.icon}</div>
            <span class="daily-condition-text">${weatherDet.description}</span>
          </div>

          <div class="daily-rain-col">
            <span class="daily-rain-pill ${rainProb >= 20 ? 'has-rain' : ''}">
              ${ICONS.droplets}
              <span>${rainProb}%</span>
            </span>
          </div>

          <div class="daily-temp-col">
            <span class="daily-min">${formatTemp(minTemp, unit)}</span>
            <div class="temp-spectrum-track">
              <div class="temp-spectrum-fill" style="left: ${leftOffset}%; width: ${barWidth}%;"></div>
            </div>
            <span class="daily-max">${formatTemp(maxTemp, unit)}</span>
            <span class="daily-chevron">${ICONS.chevronDown}</span>
          </div>
        </div>

        <div class="daily-details-accordion">
          <div class="daily-details-grid">
            <div class="daily-detail-item">
              <span class="detail-label">${ICONS.uv} UV Index</span>
              <span class="detail-value">${uvMax.toFixed(1)} (${getUvCategory(uvMax).level})</span>
            </div>
            <div class="daily-detail-item">
              <span class="detail-label">${ICONS.wind} Max Wind</span>
              <span class="detail-value">${formatWindSpeed(windMax, unit).value} ${formatWindSpeed(windMax, unit).unit}</span>
            </div>
            <div class="daily-detail-item">
              <span class="detail-label">${ICONS.cloudRainDrop} Total Rain</span>
              <span class="detail-value">${formatPrecipitation(precipSum, unit).value} ${formatPrecipitation(precipSum, unit).unit}</span>
            </div>
            <div class="daily-detail-item">
              <span class="detail-label">${ICONS.sunrise} Sun Cycle</span>
              <span class="detail-value">${formatSunTime(sunriseStr, timezone)} - ${formatSunTime(sunsetStr, timezone)}</span>
            </div>
          </div>
        </div>
      `;

      // Accordion toggle
      row.addEventListener('click', () => {
        const isExpanded = row.classList.contains('expanded');
        // Close others
        document.querySelectorAll('.daily-row.expanded').forEach(r => {
          if (r !== row) {
            r.classList.remove('expanded');
            r.setAttribute('aria-expanded', 'false');
          }
        });
        row.classList.toggle('expanded', !isExpanded);
        row.setAttribute('aria-expanded', String(!isExpanded));
      });

      row.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          row.click();
        }
      });

      elements.dailyForecastContainer.appendChild(row);
    }
  }

  /**
   * Render Search Autocomplete Suggestions
   */
  function renderSearchSuggestions(results, onSelect) {
    if (!elements.searchSuggestions) return;

    if (!results || results.length === 0) {
      elements.searchSuggestions.innerHTML = `
        <div class="suggestion-empty">
          <span>No matching cities found</span>
        </div>
      `;
      elements.searchSuggestions.classList.remove('hidden');
      return;
    }

    elements.searchSuggestions.innerHTML = '';
    results.forEach((city, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.tabIndex = 0;
      item.setAttribute('role', 'option');

      const flag = getCountryFlag(city.countryCode);
      const subtitle = [city.admin1, city.country].filter(Boolean).join(', ');

      item.innerHTML = `
        <div class="suggestion-flag">${flag}</div>
        <div class="suggestion-info">
          <span class="suggestion-name">${city.name}</span>
          <span class="suggestion-sub">${subtitle}</span>
        </div>
        <div class="suggestion-arrow">${ICONS.chevronRight}</div>
      `;

      item.addEventListener('click', () => {
        onSelect(city);
        hideSearchSuggestions();
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          onSelect(city);
          hideSearchSuggestions();
        }
      });

      elements.searchSuggestions.appendChild(item);
    });

    elements.searchSuggestions.classList.remove('hidden');
  }

  /**
   * Hide search suggestions dropdown
   */
  function hideSearchSuggestions() {
    if (elements.searchSuggestions) {
      elements.searchSuggestions.classList.add('hidden');
      elements.searchSuggestions.innerHTML = '';
    }
  }

  /**
   * Render Recent Searches Chips
   */
  function renderRecentSearches(history, onSelect) {
    if (!elements.recentSearchesList || !elements.recentSearchesSection) return;

    if (!history || history.length === 0) {
      elements.recentSearchesSection.classList.add('hidden');
      return;
    }

    elements.recentSearchesSection.classList.remove('hidden');
    elements.recentSearchesList.innerHTML = '';

    history.forEach(city => {
      const chip = document.createElement('button');
      chip.className = 'recent-chip';
      const flag = getCountryFlag(city.countryCode);
      chip.innerHTML = `
        <span class="chip-flag">${flag}</span>
        <span class="chip-name">${city.name}</span>
      `;
      chip.addEventListener('click', () => onSelect(city));
      elements.recentSearchesList.appendChild(chip);
    });
  }

  /**
   * Render Favorites Modal
   */
  function renderFavoritesModal(favorites, onSelect, onRemove) {
    if (!elements.favoritesList) return;

    if (!favorites || favorites.length === 0) {
      elements.favoritesList.innerHTML = `
        <div class="modal-empty-state">
          <div class="empty-icon">${ICONS.star}</div>
          <p>No saved favorite cities yet.</p>
          <span class="empty-sub">Click the star button on any city card to save it here for fast access.</span>
        </div>
      `;
      return;
    }

    elements.favoritesList.innerHTML = '';
    favorites.forEach(city => {
      const item = document.createElement('div');
      item.className = 'favorite-item';

      const flag = getCountryFlag(city.countryCode);
      const subtitle = [city.admin1, city.country].filter(Boolean).join(', ');

      item.innerHTML = `
        <div class="favorite-info" role="button" tabindex="0">
          <span class="favorite-flag">${flag}</span>
          <div class="favorite-text">
            <span class="favorite-name">${city.name}</span>
            <span class="favorite-sub">${subtitle}</span>
          </div>
        </div>
        <button class="favorite-remove-btn" title="Remove from favorites" aria-label="Remove ${city.name}">
          ${ICONS.close}
        </button>
      `;

      item.querySelector('.favorite-info').addEventListener('click', () => {
        onSelect(city);
        closeFavoritesModal();
      });

      item.querySelector('.favorite-remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        onRemove(city);
      });

      elements.favoritesList.appendChild(item);
    });
  }

  function openFavoritesModal() {
    if (elements.favoritesModal) {
      elements.favoritesModal.classList.remove('hidden');
      document.body.classList.add('modal-open');
    }
  }

  function closeFavoritesModal() {
    if (elements.favoritesModal) {
      elements.favoritesModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  }

  return {
    elements,
    formatTemp,
    formatWindSpeed,
    formatPrecipitation,
    updateTheme,
    updateUnitToggle,
    showToast,
    setLoading,
    showError,
    hideError,
    renderCurrentWeather,
    renderHighlights,
    renderHourlyForecast,
    renderDailyForecast,
    renderSearchSuggestions,
    hideSearchSuggestions,
    renderRecentSearches,
    renderFavoritesModal,
    openFavoritesModal,
    closeFavoritesModal
  };
})();
