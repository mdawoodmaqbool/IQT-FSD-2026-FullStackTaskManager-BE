import { config } from "../config.js";

const COUNTRIES_URL =
  "https://restcountries.com/v3.1/all?fields=name,cca2,capital,capitalInfo";
const OPEN_METEO_GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const OPEN_METEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

let countriesCache = {
  expiresAt: 0,
  data: [],
  codeSet: new Set(),
};

function externalError(message, status = 502) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw externalError("External service unavailable", 502);
    }

    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw externalError("External service timed out", 504);
    }

    throw error.status ? error : externalError("External service failed", 502);
  } finally {
    clearTimeout(timeout);
  }
}

function mapCountry(entry) {
  const latlng = entry.capitalInfo?.latlng;
  const latitude = Array.isArray(latlng) ? latlng[0] : null;
  const longitude = Array.isArray(latlng) ? latlng[1] : null;

  return {
    code: entry.cca2,
    name: entry.name?.common ?? entry.cca2,
    capital: entry.capital?.[0] ?? null,
    latitude,
    longitude,
  };
}

async function loadCountries() {
  if (countriesCache.expiresAt > Date.now() && countriesCache.data.length > 0) {
    return countriesCache;
  }

  const raw = await fetchWithTimeout(COUNTRIES_URL);
  const countries = raw
    .map(mapCountry)
    .filter((country) => country.code && country.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  countriesCache = {
    expiresAt: Date.now() + CACHE_TTL_MS,
    data: countries,
    codeSet: new Set(countries.map((country) => country.code)),
  };

  return countriesCache;
}

export async function getCountries() {
  const cache = await loadCountries();
  return cache.data.map(({ code, name, capital }) => ({ code, name, capital }));
}

export async function validateCountryCode(countryCode) {
  if (typeof countryCode !== "string" || !/^[A-Z]{2}$/.test(countryCode)) {
    return "Country code must be a valid 2-letter ISO code";
  }

  const cache = await loadCountries();
  if (!cache.codeSet.has(countryCode)) {
    return "Selected country is not supported";
  }

  return null;
}

export function getCountryName(countryCode, countries) {
  return countries.find((country) => country.code === countryCode)?.name ?? countryCode;
}

async function resolveCoordinates(country) {
  if (country.latitude != null && country.longitude != null) {
    return {
      latitude: country.latitude,
      longitude: country.longitude,
      locationLabel: country.capital ?? country.name,
    };
  }

  const query = encodeURIComponent(country.capital ?? country.name);
  const url = `${OPEN_METEO_GEO_URL}?name=${query}&count=1&language=en&format=json`;
  const geo = await fetchWithTimeout(url);
  const result = geo.results?.[0];

  if (!result) {
    throw externalError("Could not resolve location for weather", 404);
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
    locationLabel: `${result.name}${result.country ? `, ${result.country}` : ""}`,
  };
}

const WEATHER_LABELS = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  80: "Rain showers",
  95: "Thunderstorm",
};

function weatherLabel(code) {
  return WEATHER_LABELS[code] ?? "Weather update available";
}

export async function getWeatherByCountryCode(countryCode) {
  const validationError = await validateCountryCode(countryCode);
  if (validationError) {
    throw externalError(validationError, 400);
  }

  const cache = await loadCountries();
  const country = cache.data.find((entry) => entry.code === countryCode);

  if (!country) {
    throw externalError("Country not found", 404);
  }

  const { latitude, longitude, locationLabel } = await resolveCoordinates(country);

  const weatherUrl = new URL(OPEN_METEO_WEATHER_URL);
  weatherUrl.searchParams.set("latitude", String(latitude));
  weatherUrl.searchParams.set("longitude", String(longitude));
  weatherUrl.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
  );
  weatherUrl.searchParams.set("timezone", "auto");

  const forecast = await fetchWithTimeout(weatherUrl.toString());
  const current = forecast.current;

  if (!current) {
    throw externalError("Weather data unavailable", 502);
  }

  return {
    countryCode,
    countryName: country.name,
    location: locationLabel,
    temperatureC: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    windSpeedKmh: current.wind_speed_10m,
    condition: weatherLabel(current.weather_code),
    observedAt: current.time,
    source: "Open-Meteo",
  };
}

export async function warmCountriesCache() {
  if (config.nodeEnv === "development") {
    await loadCountries().catch(() => undefined);
  }
}
