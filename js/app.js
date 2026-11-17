/**
 * Main Application Controller
 * Manages state, event listeners, localStorage persistence, and coordinates UI & API.
 */

const App = (() => {
  // Application State
  const state = {
    unit: localStorage.getItem('weather_unit') || 'C',
    theme: localStorage.getItem('weather_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    currentCity: null,
    weatherData: null,
    favorites: JSON.parse(localStorage.getItem('weather_favorites') || '[]'),
    history: JSON.parse(localStorage.getItem('weather_history') || '[]'),
    searchDebounceTimer: null
  };

  // Default fallback city if no location is available
  const DEFAULT_CITY = {
    name: 'London',
    admin1: 'England',
    country: 'United Kingdom',
    countryCode: 'GB',
    latitude: 51.5085,
    longitude: -0.1257,
    timezone: 'Europe/London',
    displayName: 'London, England, United Kingdom'
  };

  /**
   * Initialize Application
   */
  async function init() {
    // 1. Setup Theme
    WeatherUI.updateTheme(state.theme);

    // 2. Setup Unit
    WeatherUI.updateUnitToggle(state.unit);

    // 3. Render initial recent searches
    WeatherUI.renderRecentSearches(state.history, (city) => loadWeather(city));

    // 4. Setup Event Listeners
    setupEventListeners();

    // 5. Load Initial City
    const savedLastCity = localStorage.getItem('weather_last_city');
    let initialCity = DEFAULT_CITY;
    if (savedLastCity) {
      try {
        initialCity = JSON.parse(savedLastCity);
      } catch {
        initialCity = DEFAULT_CITY;
      }
    }

    await loadWeather(initialCity);
  }

  /**
   * Load weather for a given city object
   * @param {Object} city - City object with latitude and longitude
   * @param {boolean} forceRefresh - If true, bypass cache
   */
  async function loadWeather(city, forceRefresh = false) {
    if (!city || !city.latitude || !city.longitude) return;

    if (forceRefresh) {
      WeatherAPI.clearCache();
    }

    WeatherUI.setLoading(true);
    WeatherUI.hideError();

    try {
      const weatherData = await WeatherAPI.getForecast(
        city.latitude,
        city.longitude,
        city.timezone || 'auto'
      );

      state.currentCity = city;
      state.weatherData = weatherData;

      // Save as last viewed city
      localStorage.setItem('weather_last_city', JSON.stringify(city));

      // Add to search history
      addToHistory(city);

      // Render all views
      renderAll();

      WeatherUI.setLoading(false);
    } catch (err) {
      console.error('Failed to load weather:', err);
      WeatherUI.setLoading(false);
      WeatherUI.showError(`Could not load weather for ${city.name}. ${err.message || 'Please check your connection.'}`);
    }
  }

  /**
   * Render all components using current state
   */
  function renderAll() {
    if (!state.currentCity || !state.weatherData) return;

    const isFav = isCityFavorite(state.currentCity);

    WeatherUI.renderCurrentWeather(state.currentCity, state.weatherData, state.unit, isFav);
    WeatherUI.renderHighlights(state.weatherData, state.unit);
    WeatherUI.renderHourlyForecast(state.weatherData, state.unit);
    WeatherUI.renderDailyForecast(state.weatherData, state.unit);
    WeatherUI.renderRecentSearches(state.history, (city) => loadWeather(city));
  }

  /**
   * Switch Temperature Unit (°C <-> °F)
   */
  function toggleUnit() {
    state.unit = state.unit === 'C' ? 'F' : 'C';
    localStorage.setItem('weather_unit', state.unit);
    WeatherUI.updateUnitToggle(state.unit);

    // Re-render UI with new unit without refetching from network
    if (state.weatherData && state.currentCity) {
      renderAll();
      WeatherUI.showToast(`Temperature unit switched to °${state.unit}`, 'info', 2000);
    }
  }

  /**
   * Switch Dark / Light Theme
   */
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('weather_theme', state.theme);
    WeatherUI.updateTheme(state.theme);
  }

  /**
   * Request Browser Geolocation
   */
  function requestCurrentLocation() {
    if (!navigator.geolocation) {
      WeatherUI.showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    WeatherUI.showToast('Locating your position...', 'info', 2000);
    WeatherUI.setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const locationInfo = await WeatherAPI.reverseGeocode(lat, lon);
          await loadWeather(locationInfo);
          WeatherUI.showToast(`Located: ${locationInfo.name}`, 'success');
        } catch (err) {
          console.warn('Reverse geocode failed, using coordinates:', err);
          const fallbackLocation = {
            name: 'Current Location',
            latitude: lat,
            longitude: lon,
            country: '',
            countryCode: '',
            displayName: `Current Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
          };
          await loadWeather(fallbackLocation);
        }
      },
      (geoError) => {
        WeatherUI.setLoading(false);
        let errorMsg = 'Unable to access your location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. You can still search for any city above.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          errorMsg = 'Location request timed out. Please try again.';
        }
        WeatherUI.showToast(errorMsg, 'error', 4000);
      },
      { timeout: 12000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  }

  /**
   * Search Input Handler with Debounce
   */
  function handleSearchInput(e) {
    const query = e.target.value.trim();

    // Toggle clear button
    if (WeatherUI.elements.searchClearBtn) {
      WeatherUI.elements.searchClearBtn.classList.toggle('hidden', query.length === 0);
    }

    clearTimeout(state.searchDebounceTimer);

    if (query.length < 2) {
      WeatherUI.hideSearchSuggestions();
      return;
    }

    state.searchDebounceTimer = setTimeout(async () => {
      try {
        const results = await WeatherAPI.searchCities(query, 6);
        WeatherUI.renderSearchSuggestions(results, (selectedCity) => {
          WeatherUI.elements.searchInput.value = '';
          if (WeatherUI.elements.searchClearBtn) {
            WeatherUI.elements.searchClearBtn.classList.add('hidden');
          }
          loadWeather(selectedCity);
        });
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 320);
  }

  /**
   * Add city to search history
   */
  function addToHistory(city) {
    if (!city || !city.name) return;

    // Filter duplicates
    state.history = state.history.filter(item => 
      !(item.name === city.name && item.country === city.country)
    );

    // Insert at front
    state.history.unshift({
      name: city.name,
      admin1: city.admin1 || '',
      country: city.country || '',
      countryCode: city.countryCode || '',
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone || 'auto'
    });

    // Keep max 7 items
    if (state.history.length > 7) {
      state.history = state.history.slice(0, 7);
    }

    localStorage.setItem('weather_history', JSON.stringify(state.history));
  }

  /**
   * Check if a city is in favorites
   */
  function isCityFavorite(city) {
    if (!city) return false;
    return state.favorites.some(fav => 
      fav.name.toLowerCase() === city.name.toLowerCase() && 
      fav.country.toLowerCase() === (city.country || '').toLowerCase()
    );
  }

  /**
   * Toggle current city favorite status
   */
  function toggleCurrentFavorite() {
    if (!state.currentCity) return;

    const isFav = isCityFavorite(state.currentCity);
    if (isFav) {
      state.favorites = state.favorites.filter(fav => 
        !(fav.name.toLowerCase() === state.currentCity.name.toLowerCase() && 
          fav.country.toLowerCase() === (state.currentCity.country || '').toLowerCase())
      );
      WeatherUI.showToast(`Removed ${state.currentCity.name} from favorites`, 'info');
    } else {
      state.favorites.push({
        name: state.currentCity.name,
        admin1: state.currentCity.admin1 || '',
        country: state.currentCity.country || '',
        countryCode: state.currentCity.countryCode || '',
        latitude: state.currentCity.latitude,
        longitude: state.currentCity.longitude,
        timezone: state.currentCity.timezone || 'auto'
      });
      WeatherUI.showToast(`Saved ${state.currentCity.name} to favorites ⭐`, 'success');
    }

    localStorage.setItem('weather_favorites', JSON.stringify(state.favorites));
    renderAll();
  }

  /**
   * Remove a city from favorites modal
   */
  function removeFavoriteCity(city) {
    state.favorites = state.favorites.filter(fav => 
      !(fav.name.toLowerCase() === city.name.toLowerCase() && 
        fav.country.toLowerCase() === (city.country || '').toLowerCase())
    );
    localStorage.setItem('weather_favorites', JSON.stringify(state.favorites));
    
    WeatherUI.renderFavoritesModal(
      state.favorites,
      (selected) => loadWeather(selected),
      (toRemove) => removeFavoriteCity(toRemove)
    );

    renderAll();
    WeatherUI.showToast(`Removed ${city.name} from favorites`, 'info');
  }

  /**
   * Setup Event Listeners
   */
  function setupEventListeners() {
    // Theme toggle
    if (WeatherUI.elements.themeToggleBtn) {
      WeatherUI.elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Unit toggle
    if (WeatherUI.elements.unitToggleBtn) {
      WeatherUI.elements.unitToggleBtn.addEventListener('click', toggleUnit);
    }

    // Refresh weather
    if (WeatherUI.elements.refreshBtn) {
      WeatherUI.elements.refreshBtn.addEventListener('click', () => {
        if (state.currentCity) {
          loadWeather(state.currentCity, true);
          WeatherUI.showToast('Refreshing latest weather data...', 'info', 2000);
        }
      });
    }

    // Geolocation button
    if (WeatherUI.elements.locateBtn) {
      WeatherUI.elements.locateBtn.addEventListener('click', requestCurrentLocation);
    }

    // Favorite star toggle
    if (WeatherUI.elements.favoriteStarBtn) {
      WeatherUI.elements.favoriteStarBtn.addEventListener('click', toggleCurrentFavorite);
    }

    // Favorites modal open/close
    if (WeatherUI.elements.favoritesBtn) {
      WeatherUI.elements.favoritesBtn.addEventListener('click', () => {
        WeatherUI.renderFavoritesModal(
          state.favorites,
          (selected) => loadWeather(selected),
          (toRemove) => removeFavoriteCity(toRemove)
        );
        WeatherUI.openFavoritesModal();
      });
    }

    if (WeatherUI.elements.closeFavoritesModalBtn) {
      WeatherUI.elements.closeFavoritesModalBtn.addEventListener('click', WeatherUI.closeFavoritesModal);
    }

    if (WeatherUI.elements.favoritesModal) {
      WeatherUI.elements.favoritesModal.addEventListener('click', (e) => {
        if (e.target === WeatherUI.elements.favoritesModal) {
          WeatherUI.closeFavoritesModal();
        }
      });
    }

    // Search input
    if (WeatherUI.elements.searchInput) {
      WeatherUI.elements.searchInput.addEventListener('input', handleSearchInput);

      WeatherUI.elements.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          WeatherUI.hideSearchSuggestions();
          WeatherUI.elements.searchInput.blur();
        } else if (e.key === 'ArrowDown') {
          const firstOption = document.querySelector('.suggestion-item');
          if (firstOption) {
            e.preventDefault();
            firstOption.focus();
          }
        }
      });
    }

    // Search clear button
    if (WeatherUI.elements.searchClearBtn) {
      WeatherUI.elements.searchClearBtn.addEventListener('click', () => {
        WeatherUI.elements.searchInput.value = '';
        WeatherUI.elements.searchClearBtn.classList.add('hidden');
        WeatherUI.hideSearchSuggestions();
        WeatherUI.elements.searchInput.focus();
      });
    }

    // Clear history
    if (WeatherUI.elements.clearHistoryBtn) {
      WeatherUI.elements.clearHistoryBtn.addEventListener('click', () => {
        state.history = [];
        localStorage.removeItem('weather_history');
        WeatherUI.renderRecentSearches([], null);
        WeatherUI.showToast('Search history cleared', 'info');
      });
    }

    // Retry button on error
    if (WeatherUI.elements.retryBtn) {
      WeatherUI.elements.retryBtn.addEventListener('click', () => {
        if (state.currentCity) {
          loadWeather(state.currentCity, true);
        } else {
          loadWeather(DEFAULT_CITY, true);
        }
      });
    }

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      const searchBox = document.querySelector('.search-box-wrapper');
      if (searchBox && !searchBox.contains(e.target)) {
        WeatherUI.hideSearchSuggestions();
      }
    });

    // Hourly forecast scroll buttons
    if (WeatherUI.elements.hourlyScrollLeftBtn && WeatherUI.elements.hourlyForecastContainer) {
      WeatherUI.elements.hourlyScrollLeftBtn.addEventListener('click', () => {
        WeatherUI.elements.hourlyForecastContainer.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }

    if (WeatherUI.elements.hourlyScrollRightBtn && WeatherUI.elements.hourlyForecastContainer) {
      WeatherUI.elements.hourlyScrollRightBtn.addEventListener('click', () => {
        WeatherUI.elements.hourlyForecastContainer.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      // Focus search with '/' key when not already in input
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        WeatherUI.elements.searchInput.focus();
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        WeatherUI.closeFavoritesModal();
      }

      // Quick refresh with 'R' or 'r' when not typing
      if ((e.key === 'r' || e.key === 'R') && document.activeElement.tagName !== 'INPUT' && !e.ctrlKey && !e.metaKey) {
        if (state.currentCity) {
          loadWeather(state.currentCity, true);
          WeatherUI.showToast('Refreshing latest weather data...', 'info', 1500);
        }
      }
    });

    // Online / Offline Detection
    window.addEventListener('online', () => {
      WeatherUI.showToast('Back online! Reconnecting...', 'success');
      if (state.currentCity) {
        loadWeather(state.currentCity, true);
      }
    });

    window.addEventListener('offline', () => {
      WeatherUI.showToast('You are offline. Showing cached weather data.', 'error', 5000);
    });
  }

  return {
    init,
    loadWeather
  };
})();

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', App.init);
