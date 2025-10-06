// utils/weatherApi.js - OpenWeatherMap API integration for FixItNow
// Features: getForecast (current/5-day forecast), suggestSchedule (based on weather for outdoor jobs)
// API Key: Set in .env as OPENWEATHER_API_KEY
// Usage: In user search/book to suggest best time/service based on rain/wind
const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getForecast = async (lat, lng) => {
  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        lat,
        lon: lng,
        appid: API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (err) {
    console.error('Weather API Error:', err.response?.data || err.message);
    throw err;
  }
};

const suggestSchedule = (forecast, serviceType) => {
  // Rule-based: Avoid outdoor services in rain/heavy wind
  const today = forecast.list[0];
  const isOutdoor = ['plumber', 'electrician', 'carpenter'].includes(serviceType);
  let suggestion = 'Good weather for scheduling.';

  if (isOutdoor && (today.weather[0].main === 'Rain' || today.wind.speed > 20)) {
    suggestion = 'Poor weather for outdoor services. Consider rescheduling or indoor alternatives.';
  }

  return suggestion;
};

module.exports = { getForecast, suggestSchedule };