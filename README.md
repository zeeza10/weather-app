# 🌤️ Aether Weather • Modern Weather Forecast Application

A beautiful, premium, responsive Weather Forecast Web Application built with vanilla **HTML5**, **CSS3**, and **JavaScript (ES6+)**, powered by the completely free **[Open-Meteo Weather API](https://open-meteo.com)**.

![Project Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)
![API](https://img.shields.io/badge/API-Open--Meteo%20(Free%2C%20No%20Key)-orange)

---

## 🌟 Live Demo & Preview Features

- **Zero API Keys & 100% Free**: Operates entirely on Open-Meteo's free, non-commercial and commercial friendly open-source API without registration or credit cards.
- **Real-Time City Search**: Live debounced autocomplete search querying thousands of global cities, regions, and countries with country flags.
- **Interactive Current Weather**:
  - Current real-time temperature with dynamic **Celsius (°C) / Fahrenheit (°F)** instant conversion.
  - Weather condition labels and animated scalable SVGs.
  - "Feels-like" apparent temperature.
  - Today's minimum and maximum temperature.
  - Local timezone-aware time and date formatting.
- **Today's Weather Highlights Grid**:
  - 💨 **Wind Status**: Live speed (km/h or mph) with interactive 360° rotating compass needle and directional labels (e.g. `SW 220°`).
  - 💧 **Humidity & Moisture**: Relative humidity with dynamic progress track and comfortable/dry/humid analysis.
  - ☀️ **UV Index**: Daily max UV rating with danger level badges (Low, Moderate, High, Very High, Extreme) and sun safety advice.
  - 🌅 **Sun Cycle**: Exact sunrise and sunset times with daylight countdown and visual daylight progress bar.
  - 🧭 **Atmospheric Pressure**: Barometric pressure in hPa with atmospheric stability assessment.
  - 👁️ **Visibility**: Distance in kilometers or miles with clear/reduced visibility categorization.
  - 🌧️ **Precipitation**: Rain volume (mm/in) and maximum probability percentage today.
- **Hourly Forecast (Next 24 Hours)**:
  - Horizontal drag & smooth scroll timeline.
  - Hour-by-hour temperature, condition icons, rain chance (`💧 %`), and wind speeds.
- **7-Day Extended Forecast**:
  - Daily weather outlook with day name, date, and condition.
  - Visual **Temperature Spectrum Bar** showcasing the relative daily temperature range against the weekly extremes.
  - Expandable accordion rows revealing deep daily metrics (UV, max wind gusts, total precipitation sum, and sunrise/sunset times).
- **Geolocation "Locate Me"**:
  - One-click browser geolocation using `navigator.geolocation` with reverse-geocoding for exact city detection.
- **Recent Searches & Quick History**:
  - Persisted in `localStorage` for instant one-click switching between your favorite spots.
- **Saved Favorites**:
  - Bookmark favorite cities with quick access modal and delete management.
- **Dark Mode & Light Mode**:
  - Glassmorphic UI with dynamic ambient weather glow adapting to sunny, clear night, rainy, stormy, cloudy, or snowy conditions.
  - Respects OS color preference (`prefers-color-scheme`) and persists user toggle in `localStorage`.
- **Keyboard Shortcuts**:
  - Press `/` anywhere to focus search.
  - Press `R` to refresh weather data.
  - Press `Esc` to close autocomplete or modals.
- **Offline & Error Resilience**:
  - Built-in network timeout protection, offline toast notification, and graceful retry states.

---

## 📂 Project Architecture

```
weather-app/
│
├── index.html              # Semantic, accessible HTML5 layout
├── README.md               # Documentation & deployment guide
│
├── css/
│   ├── style.css           # Glassmorphism, CSS variables, themes & responsive layouts
│   └── animations.css      # Keyframes, shimmers, ambient glow & micro-animations
│
├── js/
│   ├── weather-codes.js    # WMO weather code mapping & standalone SVG icon system
│   ├── api.js              # Open-Meteo client, reverse geocoding & unit conversions
│   ├── ui.js               # DOM manipulation, formatting & toast notifications
│   └── app.js              # App state, localStorage persistence & event bus
│
└── assets/                 # Static assets directory
```

---

## 🚀 How to Run Locally

Because this application is written in clean standard vanilla web technologies (HTML5, CSS3, ES6+), **no npm build steps, compilers, or Node modules are required!**

### Option 1: Direct File Opening
Simply open `index.html` directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Option 2: Python Simple HTTP Server
If you have Python installed, open your terminal inside the project directory:

```bash
# Python 3
python -m http.server 8000
```
Then visit: `http://localhost:8000`

### Option 3: VS Code Live Server
1. Open the `weather-app` folder in VS Code.
2. Install the **Live Server** extension.
3. Click **"Go Live"** in the bottom status bar.

### Option 4: Node.js `npx serve`
```bash
npx serve .
```

---

## 🌐 Free Deployment Instructions

This app is a static client-side web application, making it 100% free and easy to deploy on modern global CDNs.

### 1. Deploying to Cloudflare Pages (Free & Fastest)

#### Via Cloudflare Dashboard:
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages**.
3. Choose **Direct Upload**:
   - Give your project a name (e.g. `aether-weather`).
   - Drag and drop the `weather-app` folder (or upload its zip).
   - Click **Deploy Site**.
4. Your weather app is immediately live on `https://<your-project>.pages.dev` with free SSL and global CDN caching!

#### Via Wrangler CLI:
```bash
npm install -g wrangler
wrangler pages deploy . --project-name=aether-weather
```

---

### 2. Deploying to GitHub Pages (Free)

1. Create a new repository on [GitHub](https://github.com/new) named `weather-app`.
2. Push your source code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Modern Weather App"
   git branch -M main
   git remote add origin https://github.com/<your-username>/weather-app.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Select branch: `main`, folder: `/ (root)`.
   - Click **Save**.
4. Within 1 minute, your site will be live at:
   `https://<your-username>.github.io/weather-app/`

---

## 📡 Open-Meteo Free APIs Used

The application utilizes two primary Open-Meteo REST endpoints:

1. **Geocoding API**:
   ```
   https://geocoding-api.open-meteo.com/v1/search?name={city}&count=6&language=en&format=json
   ```
   *Resolves city queries into coordinates (`latitude`, `longitude`), administrative regions, and country codes.*

2. **Weather Forecast API**:
   ```
   https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto
   ```
   *Fetches real-time current conditions, hourly 24-hour predictions, and 7-day extended forecasts.*

---

## 🛠️ Browser Compatibility

- Google Chrome (Desktop & Mobile) - Version 88+
- Apple Safari (macOS & iOS) - Version 14+
- Mozilla Firefox - Version 85+
- Microsoft Edge - Version 88+

---

## 📄 License

This project is open-source and released under the **MIT License**. Free for personal and commercial usage.
