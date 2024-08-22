document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('search').value;
    fetchWeather(city);
});

async function fetchWeather(city) {
    try {
        showLoading();
        const coordinates = await fetchCoordinates(city);
        const weatherData = await fetchWeatherData(coordinates.latitude, coordinates.longitude);
        displayWeather(weatherData, city);
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(error.message);
    }
}

async function fetchCoordinates(city) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
    if (!response.ok) throw new Error('City not found');

    const data = await response.json();
    if (data.results && data.results.length > 0) {
        return data.results[0];
    } else {
        throw new Error('City not found');
    }
}

async function fetchWeatherData(latitude, longitude) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_min,temperature_2m_max,sunrise,sunset&timezone=auto`);
    if (!response.ok) throw new Error('Weather data not available');

    return await response.json();
}

function displayWeather(data, city) {
    const currentWeather = data.current_weather;
    const dailyWeather = data.daily;

    const weatherDetails = `
        <h2>${city}</h2>
        <img src="https://openweathermap.org/img/wn/${getWeatherIcon(currentWeather.weathercode)}@2x.png" alt="Weather Icon" class="weather-icon">
        <p class="weather-detail">Temperature: ${currentWeather.temperature}°C</p>
        <p class="weather-detail">Wind Speed: ${currentWeather.windspeed} m/s</p>
        <p class="weather-detail">Humidity: ${currentWeather.relative_humidity}%</p>
        <p class="weather-detail">Sunrise: ${formatTime(dailyWeather.sunrise[0])}</p>
        <p class="weather-detail">Sunset: ${formatTime(dailyWeather.sunset[0])}</p>
    `;

    const forecastDetails = dailyWeather.time.map((day, index) => {
        return `
            <div class="forecast-item">
                <h3>${formatDate(day)}</h3>
                <p>Min: ${dailyWeather.temperature_2m_min[index]}°C</p>
                <p>Max: ${dailyWeather.temperature_2m_max[index]}°C</p>
            </div>
        `;
    }).join('');

    document.getElementById('current-weather').innerHTML = weatherDetails;
    document.getElementById('forecast').innerHTML = forecastDetails;

    document.getElementById('weather-details').classList.remove('hidden');
}

function getWeatherIcon(code) {
    // Map weather code to icon
    return '01d'; // Placeholder, you can map the codes to actual icons
}

function formatTime(timeString) {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('weather-details').classList.add('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    document.getElementById('weather-details').innerHTML = `<p>${message}</p>`;
    document.getElementById('weather-details').classList.remove('hidden');
}
