// Quote data structure
let quotes = [];
let currentCategory = 'all';

// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');
const categoryFilter = document.getElementById('categoryFilter');

// Load quotes and settings from localStorage on startup
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

    // Load last selected category
    const lastCategory = localStorage.getItem('lastCategory');
    if (lastCategory) {
        currentCategory = lastCategory;
        categoryFilter.value = currentCategory;
    }
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    populateCategories(); // Update category filter when quotes change
}

// Populate categories in the filter dropdown
function populateCategories() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Set the last selected category
    categoryFilter.value = currentCategory;
}

// Filter quotes based on selected category
function filterQuotes() {
    currentCategory = categoryFilter.value;
    localStorage.setItem('lastCategory', currentCategory);
    
    // Show a quote from the selected category
    showRandomQuote();
}

// Show a random quote based on current filter
function showRandomQuote() {
    let filteredQuotes = currentCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === currentCategory);

    if (filteredQuotes.length === 0) {
        quoteText.textContent = "No quotes available for this category";
        quoteCategory.textContent = "";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];

    quoteText.textContent = selectedQuote.text;
    quoteCategory.textContent = `Category: ${selectedQuote.category}`;
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
    populateCategories();
    document.getElementById('newQuote').addEventListener('click', showRandomQuote);
    showRandomQuote();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Quote data structure
let quotes = [
    { text: "Life is what happens while you're busy making other plans.", category: "Life" },
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" }
];

// Function to filter quotes
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    const quoteDisplay = document.getElementById('quoteDisplay');
    
    // Save selected category to localStorage
    localStorage.setItem('selectedCategory', selectedCategory);

    // Filter quotes based on selected category
    if (selectedCategory === 'all') {
        // Display all quotes
        quoteDisplay.textContent = quotes[Math.floor(Math.random() * quotes.length)].text;
    } else {
        // Filter and display quotes from selected category
        const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        if (filteredQuotes.length > 0) {
            quoteDisplay.textContent = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)].text;
        } else {
            quoteDisplay.textContent = "No quotes available for this category";
        }
    }
}

// Function to populate categories
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to restore last selected category
function restoreLastCategory() {
    const lastCategory = localStorage.getItem('selectedCategory');
    if (lastCategory) {
        document.getElementById('categoryFilter').value = lastCategory;
        filterQuotes(); // Apply the last selected filter
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    populateCategories();
    restoreLastCategory();
});