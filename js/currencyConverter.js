const MAX_AMOUNT = 10000;

// Initialize defaults on page load
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("amount").value = 1;
    document.getElementById("sourceCurrency").value = "USD"; // Default source currency
    document.getElementById("destinationCurrency").value = "GBP"; // Default destination currency
});

// Fetch conversion rates and calculate
async function fetchConversionRates(sourceCurrency, destinationCurrency, amount) {
    try {
        const response = await fetch(`https://www.floatrates.com/daily/${sourceCurrency.toLowerCase()}.json`);
        if (!response.ok) throw new Error("Failed to fetch exchange rates");

        const data = await response.json();
        const exchangeRate = data[destinationCurrency.toLowerCase()]?.rate;

        if (!exchangeRate) {
            document.getElementById("result").innerText = `Exchange rate not available for ${destinationCurrency}`;
            return;
        }

        const convertedAmount = (amount * exchangeRate).toFixed(2);
        const timestamp = getCurrentTimestamp();
        document.getElementById("result").innerText = `Converted Amount: ${convertedAmount} ${destinationCurrency} (Timestamp: ${timestamp})`;
    } catch (error) {
        console.error(error);
        document.getElementById("result").innerText = "Error fetching conversion rates. Try again later.";
    }
}

// Get current timestamp in BST and UK format
function getCurrentTimestamp() {
    const now = new Date();
    const options = { timeZone: "Europe/London", hour12: false, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return new Intl.DateTimeFormat("en-GB", options).format(now);
}

// Handle form submission
document.getElementById("converter").addEventListener("submit", function (e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("amount").value);

    if (amount <= 0) {
        document.getElementById("result").innerText = "Error: Please enter a valid amount greater than 0.";
        return;
    }

    if (amount > MAX_AMOUNT) {
        document.getElementById("result").innerText = `Error: Amount exceeds the maximum limit of ${MAX_AMOUNT}.`;
        return;
    }

    const sourceCurrency = document.getElementById("sourceCurrency").value;
    const destinationCurrency = document.getElementById("destinationCurrency").value;
    fetchConversionRates(sourceCurrency, destinationCurrency, amount);
});