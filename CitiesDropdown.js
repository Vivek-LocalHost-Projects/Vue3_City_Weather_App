const { createApp, defineComponent } = Vue;

const CitiesDropdown = defineComponent({
    props: ['locations'], // Accept locations as a prop
    data() {
        return {
            selectedCountry: '',
            selectedState: '',
            selectedCity: '',
            states: [],
            cities: [],
            weatherData: null, // Holds weather data
            apiKey: 'OPENWEATHERMAP_API_KEY', // Replace with your API key
            loading: false, // Show loading indicator during fetch
            error: null, // Error message
        };
    },
    methods: {
        updateStates() {
            const country = this.locations.find(c => c.name === this.selectedCountry);
            this.states = country ? country.states : [];
            this.cities = [];
            this.selectedState = '';
            this.selectedCity = '';
            this.weatherData = null; // Reset weather when country changes
        },
        updateCities() {
            const state = this.states.find(s => s.name === this.selectedState);
            this.cities = state ? state.cities : [];
            this.selectedCity = '';
            this.weatherData = null; // Reset weather when state changes
        },
        async fetchWeather() {
            if (!this.selectedCity) {
                this.error = 'Please select a city.';
                return;
            }

            this.error = null;
            this.loading = true;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${this.selectedCity}&appid=${this.apiKey}&units=metric`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                this.weatherData = await response.json();
            } catch (err) {
                this.error = `Failed to fetch weather data: ${err.message}`;
            } finally {
                this.loading = false;
            }
        },
    },
    template: `
        <div>
            <label for="country">Country:</label>
            <select v-model="selectedCountry" @change="updateStates">
                <option value="" disabled>Select a country</option>
                <option v-for="country in locations" :key="country.name" :value="country.name">
                    {{ country.name }}
                </option>
            </select>

            <label for="state">State:</label>
            <select v-model="selectedState" @change="updateCities" :disabled="!states.length">
                <option value="" disabled>Select a state</option>
                <option v-for="state in states" :key="state.name" :value="state.name">
                    {{ state.name }}
                </option>
            </select>

            <label for="city">City:</label>
            <select v-model="selectedCity" :disabled="!cities.length">
                <option value="" disabled>Select a city</option>
                <option v-for="city in cities" :key="city">
                    {{ city }}
                </option>
            </select>

            <button @click="fetchWeather" :disabled="!selectedCity || loading">
                {{ loading ? 'Loading...' : 'Get Weather' }}
            </button>

            <div v-if="error" style="color: red; margin-top: 10px;">
                {{ error }}
            </div>

            <div v-if="weatherData" style="margin-top: 20px;">
                <h3>Weather in {{ weatherData.name }}</h3>
                <p>Temperature: {{ weatherData.main.temp }} °C</p>
                <p>Weather: {{ weatherData.weather[0].description }}</p>
                <p>Humidity: {{ weatherData.main.humidity }}%</p>
                <p>Wind Speed: {{ weatherData.wind.speed }} m/s</p>
            </div>
        </div>
    `,
});

export default CitiesDropdown;
