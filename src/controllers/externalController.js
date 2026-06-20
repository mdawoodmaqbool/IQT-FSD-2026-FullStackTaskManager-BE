import { getCountries, getWeatherByCountryCode } from "../services/externalApiService.js";
import { getUserById } from "../services/authService.js";

function handleError(res, error, next) {
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }

  return next(error);
}

export async function listCountries(_req, res, next) {
  try {
    const countries = await getCountries();
    res.json(countries);
  } catch (error) {
    handleError(res, error, next);
  }
}

export async function getWeather(req, res, next) {
  try {
    const user = await getUserById(req.user.id);

    if (!user?.countryCode) {
      return res.status(400).json({ message: "No country set on your profile" });
    }

    const weather = await getWeatherByCountryCode(user.countryCode);
    res.json(weather);
  } catch (error) {
    handleError(res, error, next);
  }
}
