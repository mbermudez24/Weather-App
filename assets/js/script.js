// Declare a constant variable to store the OpenWeatherMap API key.
const apiKey = '68816e16f19f0020f14989eec1f0c202';

// Retrieve references to HTML elements using their IDs.
const weatherInfoElement = document.getElementById('weatherInfo');
const cityInput = document.getElementById('cityInput');
const button = document.getElementById('getWeatherBtn');

// Add an event listener to the input field for Enter key press.
cityInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        // Call getWeather function when Enter key is pressed.
        getWeather();
    }
});


// Function to handle the retrieval of current weather and forecast data.
function getWeather() {
    // Retrieve the trimmed city name from the input field.
    const cityName = cityInput.value.trim();

    // Check if a valid city name is provided.
    if (!cityName) {
        // If not, show an alert and exit the function.
        showAlert('Please enter a city name');
        return;
    }

    // Construct URLs for the current weather and forecast API endpoints.
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;

    // Disable the button and show a loading indicator.
    button.disabled = true;
    button.innerHTML = 'Loading...';

    // Fetch current weather and forecast data concurrently using Promise.all.
    Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(([currentWeather, forecast]) => {
            // Display the current weather and forecast data.
            displayCurrentWeather(currentWeather);
            displayForecast(forecast);
        })
        .catch(error => {
            // Handle errors during data fetching.
            console.error('Error fetching weather data:', error);
            showAlert('Error fetching weather data. Please try again.');
        })
        .finally(() => {
            // Enable the button and reset its text.
            button.disabled = false;
            button.innerHTML = 'Get Weather';
        });
}

// Function to display the current weather information.
function displayCurrentWeather(data) {
    // Check if the data format for current weather is valid.
    if (!data || !data.main || !data.weather) {
        console.error('Invalid data format:', data);
        showAlert('Invalid data format for current weather. Please try again.');
        return;
    }

    // Extract relevant information from the current weather data.
    const { name, main, weather } = data;
    const temperature = main.temp;
    const description = weather[0].description;

    // Dynamically set background gradient based on temperature
    const backgroundGradient = getBackgroundGradient(temperature);

    // Construct HTML to display the current weather information.
    const weatherHTML = `
        <h2>${name}</h2>
        <p>${description}</p>
        <p>Temperature: ${temperature}°C</p>
    `;

    // Set the HTML content and background gradient of the weather info container.
    weatherInfoElement.innerHTML = weatherHTML;
    weatherInfoElement.style.background = backgroundGradient;
}

// Function to display the 5-day weather forecast.
function displayForecast(data) {
    // Check if the data format for the forecast is valid.
    if (!data || !data.list || data.list.length === 0) {
        console.error('Invalid data format for forecast:', data);
        showAlert('Invalid data format for forecast. Please try again.');
        return;
    }

    // Filter forecast entries for noon of each day.
    const forecastHTML = data.list
        .filter(entry => entry.dt_txt.includes('12:00:00'))
        .map(entry => {
            // Extract information for each forecast day.
            const date = new Date(entry.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            const temperature = entry.main.temp;
            const description = entry.weather[0].description;

            // Construct HTML for each forecast item.
            return `<div class="forecast-item">
                        <p>${day}</p>
                        <p>${description}</p>
                        <p>${temperature}°C</p>
                    </div>`;
        })
        .join('');

    // Append the forecast HTML to the weather info container.
    weatherInfoElement.innerHTML += `<div class="forecast-container">${forecastHTML}</div>`;
}


// Function to display an alert message.
function showAlert(message) {
    alert(message);
}


// Function to dynamically set background gradient based on temperature.
function getBackgroundGradient(temperature) {
    // Example: Set background gradient based on temperature range.
    if (temperature > 30) {
        return 'linear-gradient(to right, #FF4500, #FF6347)'; // Gradient for high temperature (Tomato Red)
    } else if (temperature > 20) {
        return 'linear-gradient(to right, #FFD700, #FFA500)'; // Gradient for moderate temperature (Gold)
    } else {
        return 'linear-gradient(to right, #87CEEB, #00BFFF)'; // Gradient for cool temperature (Sky Blue)
    }
}