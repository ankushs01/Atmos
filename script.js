/* ============================================
   STATE
   ============================================ */
const state = {
  unit: 'C',
  lastData: null,
  lastPlace: null,
  lastAqi: null,
  saved: [],   // [{ name, region, lat, lon, timezone }]
};

const STORAGE_KEY = 'atmos-saved-locations';

/* ============================================
   DOM REFS
   ============================================ */
const $ = (id) => document.getElementById(id);

const els = {
  body: document.body,
  form: $('searchForm'),
  input: $('cityInput'),
  suggestList: $('suggestList'),
  statusLine: $('statusLine'),
  loadingPanel: $('loadingPanel'),
  readout: $('readout'),
  emptyState: $('emptyState'),
  locateBtn: $('locateBtn'),
  unitToggle: $('unitToggle'),
  pinBtn: $('pinBtn'),
  savedRow: $('savedRow'),

  alertBanner: $('alertBanner'),
  alertIcon: $('alertIcon'),
  alertText: $('alertText'),

  placeName: $('placeName'),
  placeMeta: $('placeMeta'),
  placeTime: $('placeTime'),

  heroIcon: $('heroIcon'),
  tempValue: $('tempValue'),
  condText: $('condText'),

  windSpeed: $('windSpeed'),
  windDir: $('windDir'),

  feelsLike: $('feelsLike'),
  feelsLikeUnit: $('feelsLikeUnit'),
  humidity: $('humidity'),
  pressure: $('pressure'),
  visibility: $('visibility'),
  uvIndex: $('uvIndex'),
  uvLabel: $('uvLabel'),
  precip: $('precip'),

  aqiValue: $('aqiValue'),
  aqiLabel: $('aqiLabel'),

  wearList: $('wearList'),
  sunDot: $('sunDot'),
  sunriseTime: $('sunriseTime'),
  sunsetTime: $('sunsetTime'),
  dayLength: $('dayLength'),

  hourlyTrack: $('hourlyTrack'),
  forecastList: $('forecastList'),
  updatedAt: $('updatedAt'),

  mapFrame: $('mapFrame'),
};

/* ============================================
   WEATHER CODE → label / icon / mood
   ============================================ */
const WMO = {
  0:  { label: 'Clear sky',        icon: 'sun',   mood: 'clear-day' },
  1:  { label: 'Mainly clear',     icon: 'sun',   mood: 'clear-day' },
  2:  { label: 'Partly cloudy',    icon: 'cloud-sun', mood: 'cloudy' },
  3:  { label: 'Overcast',         icon: 'cloud', mood: 'cloudy' },
  45: { label: 'Fog',              icon: 'fog',   mood: 'fog' },
  48: { label: 'Rime fog',         icon: 'fog',   mood: 'fog' },
  51: { label: 'Light drizzle',    icon: 'drizzle', mood: 'rain' },
  53: { label: 'Drizzle',          icon: 'drizzle', mood: 'rain' },
  55: { label: 'Dense drizzle',    icon: 'drizzle', mood: 'rain' },
  56: { label: 'Freezing drizzle', icon: 'drizzle', mood: 'rain' },
  57: { label: 'Freezing drizzle', icon: 'drizzle', mood: 'rain' },
  61: { label: 'Light rain',       icon: 'rain',  mood: 'rain' },
  63: { label: 'Rain',             icon: 'rain',  mood: 'rain' },
  65: { label: 'Heavy rain',       icon: 'rain',  mood: 'rain' },
  66: { label: 'Freezing rain',    icon: 'rain',  mood: 'rain' },
  67: { label: 'Freezing rain',    icon: 'rain',  mood: 'rain' },
  71: { label: 'Light snow',       icon: 'snow',  mood: 'snow' },
  73: { label: 'Snow',             icon: 'snow',  mood: 'snow' },
  75: { label: 'Heavy snow',       icon: 'snow',  mood: 'snow' },
  77: { label: 'Snow grains',      icon: 'snow',  mood: 'snow' },
  80: { label: 'Light showers',    icon: 'rain',  mood: 'rain' },
  81: { label: 'Showers',          icon: 'rain',  mood: 'rain' },
  82: { label: 'Violent showers',  icon: 'rain',  mood: 'rain' },
  85: { label: 'Snow showers',     icon: 'snow',  mood: 'snow' },
  86: { label: 'Snow showers',     icon: 'snow',  mood: 'snow' },
  95: { label: 'Thunderstorm',     icon: 'storm', mood: 'storm' },
  96: { label: 'Thunderstorm',     icon: 'storm', mood: 'storm' },
  99: { label: 'Severe storm',     icon: 'storm', mood: 'storm' },
};

function wmoInfo(code){
  return WMO[code] || { label: 'Unknown', icon: 'cloud', mood: 'cloudy' };
}

function iconSvg(kind, size = 20){
  const icons = {
    sun: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" stroke-linecap="round"/></svg>`,
    'cloud-sun': `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="3"/><path d="M8 2.5v1.4M8 12v-.1M3.4 8H4.7M12.4 4.6l-1 1M4 4.6l1 1" stroke-linecap="round"/><path d="M7 19h10.5a3.5 3.5 0 0 0 .5-6.96A5 5 0 0 0 8.5 11.1 3.5 3.5 0 0 0 7 19z"/></svg>`,
    cloud: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 18h11.5a3.5 3.5 0 0 0 .5-6.96A6 6 0 0 0 6.6 9.7 4 4 0 0 0 6 18z"/></svg>`,
    fog: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 9h11.5a3.5 3.5 0 0 0 .3-6.98M3 14h18M3 18h18M3 10h2"/></svg>`,
    drizzle: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 13h11.5a3.5 3.5 0 0 0 .5-6.96A6 6 0 0 0 6.6 4.7 4 4 0 0 0 6 13z"/><path d="M8 18v2M12 18v2M16 18v2"/></svg>`,
    rain: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 12h11.5a3.5 3.5 0 0 0 .5-6.96A6 6 0 0 0 6.6 3.7 4 4 0 0 0 6 12z"/><path d="M7 17l-1.5 3M12 17l-1.5 3M17 17l-1.5 3"/></svg>`,
    snow: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 11h11.5a3.5 3.5 0 0 0 .5-6.96A6 6 0 0 0 6.6 2.7 4 4 0 0 0 6 11z"/><path d="M8 16v6M5 19l3-1.5 3 1.5M16 16v6M13 19l3-1.5 3 1.5"/></svg>`,
    storm: `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11h11.5a3.5 3.5 0 0 0 .5-6.96A6 6 0 0 0 6.6 2.7 4 4 0 0 0 6 11z"/><path d="M13 14l-3 5h3l-2 4"/></svg>`,
    umbrella: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9z"/><path d="M12 11v9a2 2 0 0 1-4 0"/></svg>`,
    jacket: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4l4 2 4-2 4 4-3 2v10H7V10L4 8z"/></svg>`,
    sunscreen: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6 19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4 19 5"/></svg>`,
    wind: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 8h11.5a2.5 2.5 0 1 0-2.4-3.2M3 16h14.5a2.5 2.5 0 1 1-2.4 3.2"/></svg>`,
    mask: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10c0-2 3-3 8-3s8 1 8 3-3 6-8 6-8-4-8-6z"/><path d="M4 10c2 1 4 1.5 4 1.5M20 10c-2 1-4 1.5-4 1.5"/></svg>`,
    shirt: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4 5 7l2 2v10h10V9l2-2-3-3-2 2h-4z"/></svg>`,
    snowflake: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2v20M5 6.3l14 11.4M19 6.3 5 17.7M2 12h20"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>`,
  };
  return icons[kind] || icons.cloud;
}

/* ============================================
   UTIL
   ============================================ */
function cToF(c){ return c * 9/5 + 32; }

function fmtTemp(celsius){
  const v = state.unit === 'C' ? celsius : cToF(celsius);
  return Math.round(v);
}

function degToCompass(deg){
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function showStatus(msg){
  els.statusLine.textContent = msg;
  els.statusLine.classList.toggle('hidden', !msg);
}

function clearStatus(){ showStatus(''); }

function placeKey(p){
  return `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`;
}

/* ============================================
   SAVED LOCATIONS (localStorage)
   ============================================ */
function loadSaved(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    state.saved = raw ? JSON.parse(raw) : [];
  }catch(_e){
    state.saved = [];
  }
  renderSavedRow();
}

function persistSaved(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.saved));
  }catch(_e){ /* storage unavailable — fail silently */ }
}

function isSaved(place){
  return state.saved.some(s => placeKey(s) === placeKey(place));
}

function toggleSave(place){
  if (isSaved(place)){
    state.saved = state.saved.filter(s => placeKey(s) !== placeKey(place));
  }else{
    state.saved.push({
      name: place.name, region: place.region,
      lat: place.lat, lon: place.lon, timezone: place.timezone,
    });
    if (state.saved.length > 8) state.saved.shift();
  }
  persistSaved();
  renderSavedRow();
  updatePinButton();
}

function renderSavedRow(){
  if (!state.saved.length){
    els.savedRow.classList.add('hidden');
    els.savedRow.innerHTML = '';
    return;
  }
  els.savedRow.classList.remove('hidden');
  els.savedRow.innerHTML = state.saved.map((s) => {
    const active = state.lastPlace && placeKey(s) === placeKey(state.lastPlace);
    return `
      <div class="saved-chip ${active ? 'is-active' : ''}" data-key="${placeKey(s)}">
        <span class="saved-chip__name">${escapeHtml(s.name)}</span>
        <button class="saved-chip__remove" aria-label="Remove ${escapeHtml(s.name)}" title="Remove">✕</button>
      </div>`;
  }).join('');

  els.savedRow.querySelectorAll('.saved-chip').forEach((chip, i) => {
    const s = state.saved[i];
    chip.querySelector('.saved-chip__name').addEventListener('click', () => {
      els.input.value = s.name;
      loadWeather(s);
    });
    chip.querySelector('.saved-chip__remove').addEventListener('click', (e) => {
      e.stopPropagation();
      state.saved = state.saved.filter(x => placeKey(x) !== placeKey(s));
      persistSaved();
      renderSavedRow();
      updatePinButton();
    });
  });
}

function updatePinButton(){
  if (!state.lastPlace) return;
  els.pinBtn.classList.toggle('is-pinned', isSaved(state.lastPlace));
}

els.pinBtn.addEventListener('click', () => {
  if (!state.lastPlace) return;
  toggleSave(state.lastPlace);
});

/* ============================================
   GEOCODING SUGGESTIONS (debounced)
   ============================================ */
let debounceTimer = null;

els.input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  const q = els.input.value.trim();
  if (q.length < 2){
    hideSuggestions();
    return;
  }
  debounceTimer = setTimeout(() => fetchSuggestions(q), 280);
});

async function fetchSuggestions(query){
  try{
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    renderSuggestions(data.results || []);
  }catch(err){
    hideSuggestions();
  }
}

function renderSuggestions(results){
  if (!results.length){
    hideSuggestions();
    return;
  }
  els.suggestList.innerHTML = results.map((r, i) => {
    const region = [r.admin1, r.country].filter(Boolean).join(', ');
    return `<li data-idx="${i}" tabindex="0">
      <span class="s-name">${escapeHtml(r.name)}</span>
      <span class="s-region">${escapeHtml(region)}</span>
    </li>`;
  }).join('');
  els.suggestList.classList.remove('hidden');

  els.suggestList.querySelectorAll('li').forEach((li, i) => {
    li.addEventListener('click', () => selectPlace(results[i]));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') selectPlace(results[i]);
    });
  });
}

function hideSuggestions(){
  els.suggestList.classList.add('hidden');
  els.suggestList.innerHTML = '';
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function selectPlace(r){
  els.input.value = r.name;
  hideSuggestions();
  loadWeather({
    name: r.name,
    region: [r.admin1, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
    timezone: r.timezone,
  });
}

document.addEventListener('click', (e) => {
  if (!els.suggestList.contains(e.target) && e.target !== els.input){
    hideSuggestions();
  }
});

/* ============================================
   FORM SUBMIT
   ============================================ */
els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = els.input.value.trim();
  if (!q) return;
  hideSuggestions();
  clearStatus();
  setLoading(true);
  try{
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.results || !data.results.length){
      setLoading(false);
      showStatus(`No place found matching "${q}". Try a different spelling.`);
      return;
    }
    const r = data.results[0];
    await loadWeather({
      name: r.name,
      region: [r.admin1, r.country].filter(Boolean).join(', '),
      lat: r.latitude,
      lon: r.longitude,
      timezone: r.timezone,
    });
  }catch(err){
    setLoading(false);
    showStatus('Could not reach the geocoding service. Check your connection and try again.');
  }
});

/* ============================================
   GEOLOCATION
   ============================================ */
els.locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation){
    showStatus('Your browser does not support geolocation.');
    return;
  }
  clearStatus();
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      await loadWeather({
        name: 'Current Location',
        region: '',
        lat: latitude,
        lon: longitude,
        timezone: 'auto',
      });
    },
    () => {
      setLoading(false);
      showStatus('Location access was denied or unavailable.');
    },
    { timeout: 10000 }
  );
});

/* ============================================
   UNIT TOGGLE
   ============================================ */
els.unitToggle.addEventListener('click', () => {
  state.unit = state.unit === 'C' ? 'F' : 'C';
  els.body.setAttribute('data-unit', state.unit);
  if (state.lastData) renderAll(state.lastData, state.lastPlace);
});

/* ============================================
   LOADING / VISIBILITY STATES
   ============================================ */
function setLoading(isLoading){
  els.loadingPanel.classList.toggle('hidden', !isLoading);
  if (isLoading){
    els.readout.classList.add('hidden');
    els.emptyState.classList.add('hidden');
  }
}

/* ============================================
   FETCH + RENDER WEATHER
   ============================================ */
async function loadWeather(place){
  setLoading(true);
  clearStatus();
  try{
    const params = new URLSearchParams({
      latitude: place.lat,
      longitude: place.lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation,is_day',
      hourly: 'temperature_2m,weather_code,precipitation_probability',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset',
      timezone: place.timezone || 'auto',
      forecast_days: 7,
      wind_speed_unit: 'kmh',
    });

    const visParams = new URLSearchParams({
      latitude: place.lat,
      longitude: place.lon,
      hourly: 'visibility',
      timezone: place.timezone || 'auto',
      forecast_days: 1,
    });

    const aqiParams = new URLSearchParams({
      latitude: place.lat,
      longitude: place.lon,
      current: 'us_aqi,pm2_5',
      timezone: place.timezone || 'auto',
    });

    const [res, visRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${params}`),
      fetch(`https://api.open-meteo.com/v1/forecast?${visParams}`),
    ]);

    if (!res.ok) throw new Error('forecast fetch failed');

    const data = await res.json();

    let visibilityKm = null;
    try{
      const visData = await visRes.json();
      if (visRes.ok && visData.hourly && visData.hourly.visibility){
        visibilityKm = visData.hourly.visibility[0] / 1000;
      }
    }catch(_e){ /* optional */ }

    // AQI is fetched independently — if it fails or is slow, nothing else breaks.
    let aqi = null;
    try{
      const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqiParams}`);
      const aqiData = await aqiRes.json();
      if (aqiRes.ok && aqiData.current){
        aqi = aqiData.current;
      }
    }catch(_e){
      console.warn('Air quality data unavailable:', _e);
    }

    data._visibilityKm = visibilityKm;
    data._timezone = data.timezone || place.timezone;

    state.lastData = data;
    state.lastPlace = place;
    state.lastAqi = aqi;

    renderAll(data, place, aqi);
    setLoading(false);
    els.readout.classList.remove('hidden');
    els.emptyState.classList.add('hidden');
    updatePinButton();
    renderSavedRow();
    renderMap(place);
  }catch(err){
    setLoading(false);
    showStatus('Could not load weather data right now. Please try again in a moment.');
  }
}

/* ============================================
   RENDER — ALL
   ============================================ */
function renderAll(data, place, aqi){
  const cur = data.current;
  const wmo = wmoInfo(cur.weather_code);

  // Mood / background — night override for clear/cloudy codes
  let mood = wmo.mood;
  if (cur.is_day === 0){
    if (mood === 'clear-day') mood = 'clear-night';
    else if (mood === 'cloudy') mood = 'clear-night';
  }
  els.body.setAttribute('data-mood', mood);

  // Location
  els.placeName.textContent = place.name;
  els.placeMeta.textContent = place.region || '—';

  const tzNow = new Date().toLocaleString('en-US', {
    timeZone: data._timezone,
    weekday: 'long', hour: 'numeric', minute: '2-digit',
  });
  els.placeTime.textContent = `Local time — ${tzNow}`;

  // Hero
  els.tempValue.textContent = fmtTemp(cur.temperature_2m);
  els.condText.textContent = wmo.label;
  els.heroIcon.innerHTML = iconSvg(wmo.icon, 72);

  els.feelsLike.textContent = fmtTemp(cur.apparent_temperature);
  els.feelsLikeUnit.textContent = state.unit === 'C' ? '°C' : '°F';

  // Stat cards
  els.windSpeed.textContent = Math.round(cur.wind_speed_10m);
  els.windDir.textContent = degToCompass(cur.wind_direction_10m);
  els.humidity.textContent = cur.relative_humidity_2m;
  els.pressure.textContent = Math.round(cur.surface_pressure);
  els.visibility.textContent = data._visibilityKm != null ? data._visibilityKm.toFixed(1) : '—';

  const todayUv = data.daily?.uv_index_max?.[0];
  els.uvIndex.textContent = todayUv != null ? Math.round(todayUv) : '—';
  els.uvLabel.textContent = todayUv != null ? uvLabel(todayUv) : '—';

  els.precip.textContent = cur.precipitation != null ? cur.precipitation.toFixed(1) : '0.0';

  // AQI
  renderAqi(aqi);

  // Sun arc + day length
  renderSun(data, cur);

  // Wear advice
  renderWearAdvice(cur, todayUv, data.daily?.precipitation_probability_max?.[0]);

  // Smart alerts
  renderAlert(data, cur, aqi, todayUv);

  renderHourly(data);
  renderForecast(data);

  const now = new Date();
  els.updatedAt.textContent = `Updated ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
}

function uvLabel(v){
  if (v <= 2) return 'Low';
  if (v <= 5) return 'Moderate';
  if (v <= 7) return 'High';
  if (v <= 10) return 'Very High';
  return 'Extreme';
}

/* ============================================
   AIR QUALITY
   ============================================ */
function aqiCategory(aqi){
  if (aqi == null) return { label: '—', cls: '' };
  if (aqi <= 50)  return { label: 'Good', cls: 'aqi-good' };
  if (aqi <= 100) return { label: 'Moderate', cls: 'aqi-moderate' };
  if (aqi <= 150) return { label: 'Sensitive Groups', cls: 'aqi-sensitive' };
  if (aqi <= 200) return { label: 'Unhealthy', cls: 'aqi-unhealthy' };
  if (aqi <= 300) return { label: 'Very Unhealthy', cls: 'aqi-very-unhealthy' };
  return { label: 'Hazardous', cls: 'aqi-hazardous' };
}

function renderAqi(aqi){
  const value = aqi?.us_aqi;
  if (value == null){
    els.aqiValue.textContent = '—';
    els.aqiLabel.textContent = 'Unavailable';
    els.aqiLabel.className = 'stat-card__sub';
    return;
  }
  els.aqiValue.textContent = Math.round(value);
  const cat = aqiCategory(value);
  els.aqiLabel.textContent = cat.label;
  els.aqiLabel.className = `stat-card__sub ${cat.cls}`;
}

/* ============================================
   SUN ARC + DAY LENGTH
   ============================================ */
function renderSun(data, cur){
  const sunrise = data.daily?.sunrise?.[0];
  const sunset = data.daily?.sunset?.[0];
  if (!sunrise || !sunset){
    els.sunriseTime.textContent = '—';
    els.sunsetTime.textContent = '—';
    els.dayLength.textContent = '—';
    return;
  }

  const sr = new Date(sunrise);
  const ss = new Date(sunset);
  const now = new Date(cur.time);

  els.sunriseTime.textContent = sr.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  els.sunsetTime.textContent = ss.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const totalMin = (ss - sr) / 60000;
  const hrs = Math.floor(totalMin / 60);
  const mins = Math.round(totalMin % 60);
  els.dayLength.textContent = `${hrs}h ${mins}m of daylight`;

  // position dot along arc 0..1
  let pct = (now - sr) / (ss - sr);
  pct = Math.max(0, Math.min(1, pct));

  // arc path: M 14 95 A 86 86 0 0 1 186 95  (semicircle, center 100,95 r=86)
  const angle = Math.PI * (1 - pct); // pct=0 -> angle=PI (left), pct=1 -> angle=0 (right)
  const cx = 100, cy = 95, r = 86;
  const x = cx - r * Math.cos(angle);
  const y = cy - r * Math.sin(angle);
  els.sunDot.setAttribute('cx', x.toFixed(1));
  els.sunDot.setAttribute('cy', y.toFixed(1));
  els.sunDot.style.opacity = (now < sr || now > ss) ? '0.35' : '1';
}

/* ============================================
   WHAT TO WEAR
   ============================================ */
function renderWearAdvice(cur, uv, popMax){
  const tips = [];
  const tC = cur.temperature_2m;
  const feelsC = cur.apparent_temperature;
  const wind = cur.wind_speed_10m;
  const precip = cur.precipitation || 0;
  const aqiVal = state.lastAqi?.us_aqi;

  // Rain
  if (precip > 0 || (popMax != null && popMax >= 50)){
    tips.push({ icon: 'umbrella', text: 'Bring an umbrella — rain is likely' });
  }

  // Temperature-based layering
  if (feelsC <= 0){
    tips.push({ icon: 'snowflake', text: 'Heavy coat, gloves — well below freezing' });
  }else if (feelsC <= 10){
    tips.push({ icon: 'jacket', text: 'Wear a warm jacket, it feels cold' });
  }else if (feelsC <= 18){
    tips.push({ icon: 'jacket', text: 'A light jacket or sweater is a good idea' });
  }else if (feelsC <= 27){
    tips.push({ icon: 'shirt', text: 'Comfortable in light clothing' });
  }else{
    tips.push({ icon: 'shirt', text: 'Light, breathable clothing — it\'s hot' });
  }

  // Wind
  if (wind >= 30){
    tips.push({ icon: 'wind', text: 'Windy out — secure loose items, skip the umbrella' });
  }

  // UV
  if (uv != null && uv >= 6){
    tips.push({ icon: 'sunscreen', text: 'High UV — wear sunscreen and sunglasses' });
  }

  // Air quality
  if (aqiVal != null && aqiVal > 150){
    tips.push({ icon: 'mask', text: 'Poor air quality — consider a mask outdoors' });
  }

  if (!tips.length){
    tips.push({ icon: 'check', text: 'Conditions look easy — dress as usual' });
  }

  els.wearList.innerHTML = tips.slice(0, 4).map(t =>
    `<li>${iconSvg(t.icon, 16)}<span>${t.text}</span></li>`
  ).join('');
}

/* ============================================
   SMART ALERTS
   ============================================ */
function renderAlert(data, cur, aqi, uv){
  const alerts = [];

  // Rain in next few hours
  const popNow = data.hourly?.precipitation_probability;
  const timeArr = data.hourly?.time;
  if (popNow && timeArr){
    const nowIso = cur.time;
    let idx = timeArr.findIndex(t => t >= nowIso);
    if (idx === -1) idx = 0;
    const next3 = popNow.slice(idx, idx + 3);
    const maxPop = Math.max(0, ...next3);
    if (maxPop >= 60 && (cur.precipitation || 0) === 0){
      alerts.push({ icon: 'rain', text: `Rain likely within the next few hours (${maxPop}% chance) — plan ahead` });
    }
  }

  // Frost risk
  if (cur.apparent_temperature <= 2 && cur.apparent_temperature > -50){
    alerts.push({ icon: 'snowflake', text: 'Frost risk tonight — feels near or below freezing' });
  }

  // Extreme UV
  if (uv != null && uv >= 9){
    alerts.push({ icon: 'sunscreen', text: `Extreme UV today (index ${Math.round(uv)}) — limit midday sun exposure` });
  }

  // High wind
  if (cur.wind_speed_10m >= 45){
    alerts.push({ icon: 'wind', text: `Strong winds (${Math.round(cur.wind_speed_10m)} km/h) — secure outdoor items` });
  }

  // Poor air quality
  if (aqi?.us_aqi != null && aqi.us_aqi > 150){
    alerts.push({ icon: 'mask', text: `Unhealthy air quality (AQI ${Math.round(aqi.us_aqi)}) — limit time outdoors` });
  }

  if (alerts.length){
    const top = alerts[0];
    els.alertIcon.innerHTML = iconSvg(top.icon, 20);
    els.alertText.textContent = top.text;
    els.alertBanner.classList.remove('hidden');
  }else{
    els.alertBanner.classList.add('hidden');
  }
}

/* ============================================
   RENDER — HOURLY STRIP
   ============================================ */
function renderHourly(data){
  const { time, temperature_2m, weather_code, precipitation_probability } = data.hourly;

  const nowIso = data.current.time;
  let startIdx = time.findIndex(t => t >= nowIso);
  if (startIdx === -1) startIdx = 0;

  const slice = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, time.length); i++){
    slice.push({
      time: time[i],
      temp: temperature_2m[i],
      code: weather_code[i],
      pop: precipitation_probability ? precipitation_probability[i] : null,
    });
  }

  els.hourlyTrack.innerHTML = slice.map((h, i) => {
    const d = new Date(h.time);
    const label = i === 0 ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric' });
    const wmo = wmoInfo(h.code);
    const pop = (h.pop != null && h.pop > 0) ? `${h.pop}%` : '';
    return `
      <div class="hour-item">
        <span class="hour-item__time">${label}</span>
        <span class="hour-item__icon">${iconSvg(wmo.icon, 24)}</span>
        <span class="hour-item__temp">${fmtTemp(h.temp)}°</span>
        <span class="hour-item__precip">${pop}</span>
      </div>`;
  }).join('');
}

/* ============================================
   RENDER — 7 DAY FORECAST
   ============================================ */
function renderForecast(data){
  const { time, weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max } = data.daily;

  const weekMin = Math.min(...temperature_2m_min);
  const weekMax = Math.max(...temperature_2m_max);
  const span = Math.max(1, weekMax - weekMin);

  els.forecastList.innerHTML = time.map((dateStr, i) => {
    const d = new Date(dateStr + 'T12:00:00');
    const dayName = i === 0 ? 'Today' : d.toLocaleDateString([], { weekday: 'short' });
    const wmo = wmoInfo(weather_code[i]);
    const lo = temperature_2m_min[i];
    const hi = temperature_2m_max[i];
    const pop = precipitation_probability_max ? precipitation_probability_max[i] : 0;

    const leftPct = ((lo - weekMin) / span) * 100;
    const widthPct = ((hi - lo) / span) * 100;

    return `
      <div class="day-row">
        <span class="day-row__name">${dayName}</span>
        <span class="day-row__icon">${iconSvg(wmo.icon, 22)}</span>
        <span class="day-row__cond">${wmo.label}</span>
        <span class="day-row__precip">${pop > 0 ? pop + '%' : ''}</span>
        <span class="day-row__range">
          <span class="day-row__lo">${fmtTemp(lo)}°</span>
          <span class="range-bar"><span class="range-bar__fill" style="left:${leftPct}%; width:${widthPct}%;"></span></span>
          <span class="day-row__hi">${fmtTemp(hi)}°</span>
        </span>
      </div>`;
  }).join('');
}

/* ============================================
   RADAR MAP (RainViewer embed)
   ============================================ */
function renderMap(place){
  // Build (once) or reposition the Leaflet map using RainViewer's documented
  // Weather Maps API: https://www.rainviewer.com/api/weather-maps-api.html
  if (!window.L){
    // Leaflet not loaded yet — load CSS+JS from its official CDN, then init.
    loadLeafletThenRenderMap(place);
    return;
  }
  initOrUpdateMap(place);
}

let _leafletLoading = false;

function loadLeafletThenRenderMap(place){
  if (_leafletLoading){
    setTimeout(() => renderMap(place), 300);
    return;
  }
  _leafletLoading = true;

  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(cssLink);

  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  script.onload = () => {
    _leafletLoading = false;
    initOrUpdateMap(place);
  };
  script.onerror = () => {
    _leafletLoading = false;
    els.mapFrame.innerHTML = '<p class="map-error">Could not load the map library. Check your connection.</p>';
  };
  document.head.appendChild(script);
}

const mapState = { map: null, radarLayers: [], frameIndex: 0, timer: null };

function initOrUpdateMap(place){
  els.mapFrame.innerHTML = '<div id="leafletMap" style="width:100%;height:100%;"></div><div class="map-credit">Radar by <a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a></div>';

  if (mapState.map){
    mapState.map.remove();
    mapState.map = null;
  }
  if (mapState.timer){ clearInterval(mapState.timer); mapState.timer = null; }

  const map = L.map('leafletMap', {
    center: [place.lat, place.lon],
    zoom: 6,
    zoomControl: true,
    attributionControl: true,
  });
  mapState.map = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO',
    maxZoom: 10,
  }).addTo(map);

  L.marker([place.lat, place.lon]).addTo(map);

  fetch('https://api.rainviewer.com/public/weather-maps.json')
    .then(r => r.json())
    .then(meta => {
      const frames = meta?.radar?.past || [];
      if (!frames.length) return;
      const host = meta.host;

      mapState.radarLayers = frames.map(f =>
        L.tileLayer(`${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`, { opacity: 0.6, zIndex: 10 })
      );

      mapState.frameIndex = mapState.radarLayers.length - 1;
      mapState.radarLayers[mapState.frameIndex].addTo(map);

      // simple animation loop through the last few frames
      mapState.timer = setInterval(() => {
        const layers = mapState.radarLayers;
        if (!layers.length) return;
        map.removeLayer(layers[mapState.frameIndex]);
        mapState.frameIndex = (mapState.frameIndex + 1) % layers.length;
        layers[mapState.frameIndex].addTo(map);
      }, 700);
    })
    .catch(() => { /* radar overlay optional — base map still shows */ });
}

/* ============================================
   INIT
   ============================================ */
els.body.setAttribute('data-unit', state.unit);
els.emptyState.classList.remove('hidden');
loadSaved();