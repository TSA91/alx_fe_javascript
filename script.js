// Quote data structure
let quotes = [
    { text: "Life is what happens while you're busy making other plans.", category: "Life" },
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "Stay hungry, stay foolish.", category: "Motivation" }
];

// DOM Elements
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryButtons = document.getElementById('categoryButtons');

// Current filter category
let currentCategory = null;

// Initialize the application
function init() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    updateCategoryButtons();
    showRandomQuote();
}

// Show a random quote based on category filter
function showRandomQuote() {
    let filteredQuotes = currentCategory 
        ? quotes.filter(quote => quote.category === currentCategory)
        : quotes;

    if (filteredQuotes.length === 0) {
        quoteText.textContent = "No quotes available for this category";
        quoteCategory.textContent = "";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];

    // Create and append elements with animation
    quoteText.textContent = selectedQuote.text;
    quoteCategory.textContent = `Category: ${selectedQuote.category}`;

    // Add fade-in animation
    quoteText.style.opacity = 0;
    quoteCategory.style.opacity = 0;
    
    setTimeout(() => {
        quoteText.style.opacity = 1;
        quoteCategory.style.opacity = 1;
    }, 50);
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
    
    // Clear input fields
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Update category buttons and show the new quote
    updateCategoryButtons();
    showRandomQuote();
}

// Update category filter buttons
function updateCategoryButtons() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing buttons
    categoryButtons.innerHTML = '';

    // Create "All" button
    const allButton = createCategoryButton('All', null);
    categoryButtons.appendChild(allButton);

    // Create category buttons
    categories.forEach(category => {
        const button = createCategoryButton(category, category);
        categoryButtons.appendChild(button);
    });
}

// Create a category filter button
function createCategoryButton(text, category) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add('category-btn');
    
    if (category === currentCategory) {
        button.classList.add('active');
    }

    button.addEventListener('click', () => {
        currentCategory = category;
        // Update active state of all buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        showRandomQuote();
    });

    return button;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);