// Global variables
let currentIndex = 0;
let chartInstance = null;
const NUM_MONTHS_TO_DISPLAY = 12;
let isForecastMode = false;

// Load data from a hardcoded JSON file
fetch("data/fuel_prices.json")
    .then((response) => response.json())
    .then((data) => {
        const fuelPrices = data.fuelPrices;

        // Display initial data
        updateChart(fuelPrices, currentIndex);

        // Event listeners for navigation
        document.getElementById("prev").addEventListener("click", () => {
            if (isForecastMode) return;
            if (currentIndex > 0) {
                currentIndex--;
                updateChart(fuelPrices, currentIndex);
            } else {
                alert("Cannot go further back than January 1996.");
            }
        });

        document.getElementById("next").addEventListener("click", () => {
            if (isForecastMode) return;
            if (currentIndex < fuelPrices.length - NUM_MONTHS_TO_DISPLAY) {
                currentIndex++;
                updateChart(fuelPrices, currentIndex);
            } else {
                alert("Cannot go beyond the current month.");
            }
        });

        // Event listener for mode switching
        document.getElementById("switch-mode").addEventListener("click", () => {
            isForecastMode = !isForecastMode;
            document.getElementById("switch-mode").textContent = isForecastMode
                ? "Switch to Historical"
                : "Switch to Forecast";
            updateChart(fuelPrices, currentIndex);
        });

        // Event listeners for filtering
        document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
            checkbox.addEventListener("change", () => {
                updateChart(fuelPrices, currentIndex);
            });
        });
    });

// Function to update the chart
function updateChart(fuelPrices, index) {
    const labels = isForecastMode
        ? generateForecastLabels()
        : fuelPrices.slice(index, index + NUM_MONTHS_TO_DISPLAY).map((entry) => entry.date);

    const datasets = [];
    if (document.getElementById("filterGas").checked) {
        datasets.push(createDataset("Gas", getData(fuelPrices, index, "gas"), "#007BFF"));
    }
    if (document.getElementById("filterElectricity").checked) {
        datasets.push(createDataset("Electricity", getData(fuelPrices, index, "electricity"), "#FF5722"));
    }
    if (document.getElementById("filterSolidFuels").checked) {
        datasets.push(createDataset("Solid Fuels", getData(fuelPrices, index, "solidFuels"), "#4CAF50"));
    }
    if (document.getElementById("filterLiquidFuels").checked) {
        datasets.push(createDataset("Liquid Fuels", getData(fuelPrices, index, "liquidFuels"), "#FFC107"));
    }

    const ctx = document.getElementById("fuelChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

// Helper functions
function createDataset(label, data, color) {
    return { label, data, borderColor: color, fill: false };
}

function getData(fuelPrices, index, key) {
    if (isForecastMode) return generateForecastData(fuelPrices, key);
    return fuelPrices.slice(index, index + NUM_MONTHS_TO_DISPLAY).map((entry) => entry[key]);
}

function generateForecastLabels() {
    const now = new Date();
    const labels = [];
    for (let i = 1; i <= 12; i++) {
        now.setMonth(now.getMonth() + 1);
        labels.push(now.toLocaleDateString("en-GB", { month: "short", year: "numeric" }));
    }
    return labels;
}

function generateForecastData(fuelPrices, key) {
    const lastPrices = fuelPrices.slice(-12).map((entry) => entry[key]);
    const slope = (lastPrices[lastPrices.length - 1] - lastPrices[0]) / lastPrices.length;
    return lastPrices.map((price, i) => +(price + slope * i).toFixed(1));
}