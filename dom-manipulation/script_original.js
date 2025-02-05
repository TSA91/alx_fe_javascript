// Initial quotes database
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success" },
    { text: "The best way to predict the future is to create it.", category: "wisdom" },
    { text: "Don't watch the clock; do what it does. Keep going.", category: "motivation" }
];

// DOM elements
const quoteText = document.getElementById('quote-text');
const generateBtn = document.getElementById('generate-btn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Generate random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    quoteText.textContent = "${selectedQuote.text}";
}

// Add new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim().toLowerCase();

    if (!text || !category) {
        alert('Please fill in all fields');
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    
    // Clear inputs
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Save to local storage
    saveToLocalStorage();
    
    // Show the new quote
    showRandomQuote();
}

// Local Storage functions
function saveToLocalStorage() {
    localStorage.setItem('quoteGeneratorData', JSON.stringify(quotes));
}

function loadFromLocalStorage() {
    const storedData = localStorage.getItem('quoteGeneratorData');
    if (storedData) {
        quotes = JSON.parse(storedData);
    }
}

// Initialize
loadFromLocalStorage();
generateBtn.addEventListener('click', showRandomQuote);
showRandomQuote();