// Weather Dashboard - Assignment 4
// Gets the current weather of a city from the OpenWeatherMap API.

const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// Elements
const form = document.querySelector("#search-form");
const cityInput = document.querySelector("#city-input");
const searchBtn = document.querySelector("#search-btn");
const loading = document.querySelector("#loading");
const errorBox = document.querySelector("#error");
const errorText = document.querySelector("#error-text");
const emptyBox = document.querySelector("#empty");
const weatherBox = document.querySelector("#weather");


// ---------- Fetching ----------

async function getWeather(city) {
  const url = `${API_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

  // fetch only throws when there is no response at all (no internet, blocked...)
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error("Could not connect to the weather service. Check your internet connection and try again.");
  }

  // Non-200 responses: give the user a clear message for each case
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`No city called "${city}" was found. Check the spelling and try again.`);
    } else if (response.status === 401) {
      throw new Error("The API key is missing or not valid. See the README to set it up.");
    } else if (response.status === 429) {
      throw new Error("Too many requests. Please wait a minute and try again.");
    } else {
      throw new Error(`The weather service returned an error (${response.status}). Please try again later.`);
    }
  }

  const data = await response.json();
  return data;
}


// ---------- Search ----------

async function handleSearch(event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  if (typeof API_KEY === "undefined" || API_KEY === "" || API_KEY === "YOUR_API_KEY_HERE") {
    showError("No API key found. Copy js/config.example.js to js/config.js and add your OpenWeatherMap key (see README).");
    return;
  }

  showLoading();

  try {
    const data = await getWeather(city);
    showWeather(data);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

form.addEventListener("submit", handleSearch);


// ---------- Rendering ----------

function showWeather(data) {
  const weather = data.weather[0];

  document.querySelector("#city-name").textContent = `${data.name}, ${data.sys.country}`;
  document.querySelector("#local-time").textContent = getLocalTime(data.timezone);

  const icon = document.querySelector("#weather-icon");
  icon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  icon.alt = weather.description;

  document.querySelector("#temp").textContent = `${Math.round(data.main.temp)}°C`;
  document.querySelector("#description").textContent = weather.description;

  document.querySelector("#feels-like").textContent = `${Math.round(data.main.feels_like)}°C`;
  document.querySelector("#humidity").textContent = `${data.main.humidity}%`;
  // the API gives wind in m/s, convert to km/h
  document.querySelector("#wind").textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  document.querySelector("#pressure").textContent = `${data.main.pressure} hPa`;
  document.querySelector("#visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;
  document.querySelector("#min-max").textContent =
    `${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°`;

  errorBox.classList.add("hidden");
  emptyBox.classList.add("hidden");
  weatherBox.classList.remove("hidden");
}

// timezone is the city's offset from UTC in seconds
function getLocalTime(timezone) {
  const cityTime = new Date(Date.now() + timezone * 1000);
  return cityTime.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  });
}

function showLoading() {
  loading.classList.remove("hidden");
  errorBox.classList.add("hidden");
  emptyBox.classList.add("hidden");
  weatherBox.classList.add("hidden");
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";
}

function hideLoading() {
  loading.classList.add("hidden");
  searchBtn.disabled = false;
  searchBtn.textContent = "Search";
}

function showError(message) {
  errorText.textContent = message;
  errorBox.classList.remove("hidden");
  emptyBox.classList.add("hidden");
  weatherBox.classList.add("hidden");
}
