//script.js
// Initial quotes database
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success" },
    { text: "The best way to predict the future is to create it.", category: "wisdom" },
    { text: "Don't watch the clock; do what it does. Keep going.", category: "motivation" }
];

// DOM elements
const quoteDisplay = document.getElementById('quote-display');
const generateBtn = document.getElementById('generate-btn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Add to DOM elements section
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('importFile');

// Add import function
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!validateImportedQuotes(importedQuotes)) {
                throw new Error('Invalid quote format');
            }

            // Remove duplicates when merging
            const uniqueQuotes = mergeQuotes(quotes, importedQuotes);
            quotes = uniqueQuotes;
            
            saveToLocalStorage();
            showRandomQuote();
            showNotification('Quotes imported successfully!');
            
        } catch (error) {
            showNotification('Error importing quotes. Check file format.', 'error');
            console.error('Import error:', error);
        }
    };

    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };

    reader.readAsText(file);
}

function validateImportedQuotes(importedQuotes) {
    return Array.isArray(importedQuotes) && 
           importedQuotes.every(quote => 
               quote.text && 
               typeof quote.text === 'string' &&
               quote.category &&
               typeof quote.category === 'string'
           );
}

function mergeQuotes(existing, imported) {
    const combined = [...existing, ...imported];
    return Array.from(new Set(combined.map(q => JSON.stringify(q))))
                .map(str => JSON.parse(str));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add to Event Listeners section
importFile.addEventListener('change', importFromJsonFile);

// Add export function
function exportToJson() {
    const quotesJson = JSON.stringify(quotes, null, 2);
    const blob = new Blob([quotesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'quotes.json';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}

// Add to Event Listeners section
exportBtn.addEventListener('click', exportToJson);

// Quote Generation and Addition
// Add to DOM elements section
const categoryFilter = document.getElementById('categoryFilter');

// Add category filtering functions
// Add after DOM elements section
const LAST_CATEGORY_KEY = 'lastSelectedCategory';

// Rename and enhance the existing updateCategoryOptions to populateCategories
function populateCategories() {
    const categories = new Set(quotes.map(quote => quote.category));
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    // Restore last selected category
    const lastCategory = localStorage.getItem(LAST_CATEGORY_KEY);
    if (lastCategory && categories.has(lastCategory)) {
        categoryFilter.value = lastCategory;
    }
}
// Update filterQuotes function
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem(LAST_CATEGORY_KEY, selectedCategory);
    
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.textContent = 'No quotes in this category';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = "${selectedQuote.text}";
}

// Update showRandomQuote function to use filterQuotes
// Remove duplicate showRandomQuote function and keep only this version
// Keep only one version of showRandomQuote
function showRandomQuote() {
    filterQuotes();
}

// Keep only one version of initialize and remove syncWithServer
function initialize() {
    loadFromLocalStorage();
    populateCategories();
    
    // Add the form to the container
    const container = document.querySelector('.container');
    container.appendChild(createAddQuoteForm());
    
    showRandomQuote();
}

// Clean up event listeners section
categoryFilter.addEventListener('change', filterQuotes);
generateBtn.addEventListener('click', showRandomQuote);


// Start the application
initialize();

// Update event listener
categoryFilter.removeEventListener('change', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);

function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteText.textContent = 'No quotes in this category';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const selectedQuote = filteredQuotes[randomIndex];
    quoteText.textContent = "${selectedQuote.text}";
}

// Add new constant for categories storage
const CATEGORIES_KEY = 'quoteCategories';

// Update loadFromLocalStorage function
function loadFromLocalStorage() {
    const storedQuotes = localStorage.getItem('quotes');
    const storedCategories = localStorage.getItem(CATEGORIES_KEY);
    
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Update addQuote function
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
    
    saveToLocalStorage();
    populateCategories(); // Changed from updateCategoryOptions
    filterQuotes(); // Show quotes from new category
    showNotification('Quote added successfully!');
}

// Update saveToLocalStorage function
function saveToLocalStorage() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    const categories = Array.from(new Set(quotes.map(quote => quote.category)));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function createAddQuoteForm() {
    const form = document.createElement('div');
    form.className = 'add-quote-section';
    
    form.innerHTML = `
        <h2>Add New Quote</h2>
        <div>
            <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
            <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
            <button onclick="addQuote()">Add Quote</button>
        </div>
    `;
    
    return form;
}

// Update initialize function
function initialize() {
    loadFromLocalStorage();
    updateCategoryOptions();
    showRandomQuote();
    setInterval(syncWithServer, 5000);
}

// Add category filter event listener
categoryFilter.addEventListener('change', showRandomQuote);

// Event Listeners
generateBtn.addEventListener('click', showRandomQuote);

// Start the application
initialize();