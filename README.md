# 🌤️ Atmos — Weather

A modern, glassmorphism weather app with live conditions, air quality, smart alerts, and an animated precipitation radar — built with plain HTML, CSS, and JavaScript. No frameworks, no build step, no API keys required.

![No API Key Required](https://img.shields.io/badge/API%20Key-Not%20Required-success)
![No Build Step](https://img.shields.io/badge/Build%20Step-None-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🚀 Live Demo **Live Preview:** [https://atmos-ankush.vercel.app/](https://atmos-ankush.vercel.app/)

---

## ✨ Features

- 🌡️ **Live current conditions** — temperature, feels-like, humidity, wind, pressure, visibility, UV index, and precipitation
- 🎨 **Mood-reactive background** — the gradient shifts based on actual weather (clear, cloudy, rain, snow, storm, fog, day/night)
- 🌬️ **Air Quality Index** — real-time US AQI with color-coded health categories
- 👕 **What to Wear** — smart suggestions based on temperature, wind, rain, UV, and air quality
- ☀️ **Sunrise / Sunset** — visual arc showing daylight progress and total day length
- 🚨 **Smart Alerts** — surfaces the most urgent condition (incoming rain, frost risk, extreme UV, high wind, poor air quality)
- 📌 **Saved Locations** — pin your favorite cities and switch between them instantly
- 🗺️ **Live Precipitation Radar** — animated radar map powered by RainViewer
- ⏰ **24-hour and 7-day forecasts**
- 🌡️ **°C / °F toggle**
- 📱 **Fully responsive** — tuned for mobile, tablet, laptop, and large desktop

---

## 🛠️ Built With

- **HTML5 / CSS3 / Vanilla JavaScript** — no frameworks, no bundler
- **[Open-Meteo](https://open-meteo.com/)** — weather forecast, geocoding, and air quality data (free, no key required)
- **[RainViewer](https://www.rainviewer.com/)** — live precipitation radar tiles (free, no key required)
- **[Leaflet.js](https://leafletjs.com/)** — interactive map rendering
- **Google Fonts** — Outfit & Inter

---

## 🚀 Getting Started

No installation, no dependencies, no build process.

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   ```
2. Open `index.html` in your browser.

That's it — the app works straight from the file system or any static host.

---

## 📁 Project Structure

```
.
├── index.html      # Markup
├── style.css       # Styling, animations, responsive layout
├── script.js       # API calls, rendering logic, interactivity
├── favicon.svg     # Browser tab icon
└── README.md
```

---

## 🌐 Deploying with GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select the `main` branch and `/ (root)` folder
4. Save — your live site will be available at:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```

---

## 🔑 API Usage Notes

This project uses **free, non-commercial APIs** that require no signup or key:

| Service | Limit | Notes |
|---|---|---|
| Open-Meteo | 10,000 calls/day | Free for non-commercial use ([terms](https://open-meteo.com/en/terms)) |
| RainViewer | No hard limit | Free for personal/educational use, attribution required |

If you plan to scale this into a commercial product (ads, subscriptions), check each provider's commercial terms first.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## Credit
If you use this project or build on it, a mention or link back is appreciated — not legally required, but it makes my day. 🙂

---

## 🙏 Acknowledgements

- Weather and air quality data from [Open-Meteo](https://open-meteo.com/)
- Radar imagery from [RainViewer](https://www.rainviewer.com/)
- Map tiles from [OpenStreetMap](https://www.openstreetmap.org/) / [CARTO](https://carto.com/)
