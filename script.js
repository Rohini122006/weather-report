const apiKey = "2ca1982bf0c4b85ebe2d63781d496912";

function getWeather() {
    const city = document.getElementById("cityInput").value.trim();

    if (city === "") {
        alert("Please enter city name");
        return;
    }

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(res => {
            if (!res.ok) {
                throw new Error("Please enter a valid city name");
            }
            return res.json();
        })
        .then(data => {
            displayCurrentWeather(data);

            const lat = data.coord.lat;
            const lon = data.coord.lon;

            getHourlyForecast(lat, lon);
            getAQI(lat, lon);
        })
        .catch(error => {
            document.getElementById("currentWeather").innerHTML = `
                <h2 style="color:red;">${error.message}</h2>
            `;
            document.getElementById("hourlyForecast").innerHTML = "";
            document.getElementById("extraInfo").innerHTML = "";
        });
}

function displayCurrentWeather(data) {
    const icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    let clothing = "";
    let travel = "";

    if (data.main.temp < 20) {
        clothing = "🧥 Wear a jacket";
    } else if (data.main.temp > 35) {
        clothing = "🥤 Stay hydrated";
    } else {
        clothing = "👕 Comfortable outfit";
    }

    if (data.weather[0].main === "Rain") {
        travel = "☔ Carry umbrella";
    } else {
        travel = "🚗 Great day for travel";
    }

    document.getElementById("currentWeather").innerHTML = `
        <div class="weather-main">
            <h2>${data.name}, ${data.sys.country}</h2>
            <img src="${icon}" alt="weather icon">
            <div class="temp">${Math.round(data.main.temp)}°C</div>
            <p>${data.weather[0].main}</p>
        </div>

        <div class="info-grid">
            <div class="card">💧 Humidity: ${data.main.humidity}%</div>
            <div class="card">🌬 Wind: ${data.wind.speed} m/s</div>
            <div class="card">🌅 Sunrise: ${sunrise}</div>
            <div class="card">🌇 Sunset: ${sunset}</div>
        </div>
    `;

    document.getElementById("extraInfo").innerHTML = `
        <div class="info-grid">
            <div class="card">${clothing}</div>
            <div class="card">${travel}</div>
        </div>
    `;
}

function getHourlyForecast(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            let html = `
                <h2 style="margin-top:20px;">Next 24 Hours Forecast</h2>
                <div class="hourly">
            `;

            data.list.slice(0, 8).forEach(item => {
                const time = new Date(item.dt * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const icon = `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;

                html += `
                    <div class="hour-card">
                        <h4>${time}</h4>
                        <img src="${icon}" alt="forecast icon">
                        <p>${Math.round(item.main.temp)}°C</p>
                        <p>${item.weather[0].main}</p>
                    </div>
                `;
            });

            html += `</div>`;
            document.getElementById("hourlyForecast").innerHTML = html;
        });
}

function getAQI(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
            const aqi = data.list[0].main.aqi;

            document.getElementById("extraInfo").innerHTML += `
                <div class="info-grid">
                    <div class="card">🌫 Air Quality Index: ${aqi}</div>
                </div>
            `;
        });
}

function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
                .then(res => res.json())
                .then(data => {
                    displayCurrentWeather(data);
                    getHourlyForecast(lat, lon);
                    getAQI(lat, lon);
                });
        },
        error => {
            document.getElementById("currentWeather").innerHTML = `
                <h2>Please allow location access or search manually.</h2>
            `;
        }
    );
}

/* Auto load current location weather when page opens */
window.onload = function () {
    getLocationWeather();
};