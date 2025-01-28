// Quote data structure
let quotes = [];

// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');
const lastViewed = document.getElementById('lastViewed');

// Load quotes from localStorage on startup
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none stored
        quotes = [
            { text: "Life is what happens while you're busy making other plans.", category: "Life" },
            { text: "The only way to do great work is to love what you do.", category: "Work" },
            { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" }
        ];
        saveQuotes();
    }
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteText.textContent = "No quotes available";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];

    quoteText.textContent = selectedQuote.text;
    quoteCategory.textContent = `Category: ${selectedQuote.category}`;

    // Store last viewed quote in sessionStorage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(selectedQuote));
    updateLastViewed();
}

// Update last viewed quote display
function updateLastViewed() {
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        lastViewed.textContent = quote.text;
    }
}

// Add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');

    if (!newQuoteText.value || !newQuoteCategory.value) {
        alert('Please fill in both the quote and category fields');
        return;
    }

    const newQuote = {
        text: newQuoteText.value,
        category: newQuoteCategory.value.trim()
    };

    quotes.push(newQuote);
    saveQuotes();
    
    // Clear input fields
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    showRandomQuote();
}

// Export quotes to JSON file
function exportToJson() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes = quotes.concat(importedQuotes);
                saveQuotes();
                showRandomQuote();
                alert('Quotes imported successfully!');
            } else {
                throw new Error('Invalid format');
            }
        } catch (error) {
            alert('Error importing quotes. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// Initialize the application
function init() {
    loadQuotes();
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    updateLastViewed();
    showRandomQuote();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);