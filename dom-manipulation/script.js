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
// Add after API_URL constant
const API_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};

// Add postQuoteToServer function
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: API_HEADERS,
            body: JSON.stringify({
                title: quote.category,
                body: quote.text
            })
        });

        if (!response.ok) throw new Error('Failed to post quote');
        return await response.json();
    } catch (error) {
        console.error('Error posting quote:', error);
        showNotification('Failed to sync quote with server', 'error');
        return null;
    }
}

// Update addQuote function to include server sync
async function addQuote() {
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
    populateCategories();
    filterQuotes();
    showNotification('Quote added successfully!');

    // Sync new quote with server
    const serverResponse = await postQuoteToServer(newQuote);
    if (serverResponse) {
        showNotification('Quote synced with server!');
    }
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

// Add after the existing constants
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Add fetchQuotesFromServer function
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const posts = await response.json();
        // Convert posts to quote format
        return posts.slice(0, 5).map(post => ({
            text: post.body.split('\n')[0],
            category: post.title.split(' ')[0].toLowerCase()
        }));
    } catch (error) {
        console.error('Error fetching quotes:', error);
        showNotification('Failed to fetch quotes from server', 'error');
        return [];
    }
}

// Add syncWithServer function
async function syncWithServer() {
    try {
        const serverQuotes = await fetchQuotesFromServer();
        if (serverQuotes.length > 0) {
            // Server data overrides local data for conflict resolution
            quotes = mergeQuotes(serverQuotes, quotes);
            saveToLocalStorage();
            populateCategories();
            filterQuotes();
            showNotification('Quotes synced with server successfully!');
        }
    } catch (error) {
        console.error('Sync failed:', error);
        showNotification('Failed to sync with server', 'error');
    }
}

// Update initialize function
function initialize() {
    loadFromLocalStorage();
    populateCategories();
    showRandomQuote();
    
    // Initial sync and set up periodic sync
    syncQuotes();
    setInterval(syncQuotes, 30000); // Sync every 30 seconds
}

// Add syncQuotes function
async function syncQuotes() {
    try {
        // First, get server quotes
        const serverQuotes = await fetchQuotesFromServer();
        
        // Then, post local quotes that aren't on server
        for (const quote of quotes) {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: API_HEADERS,
                body: JSON.stringify({
                    title: quote.category,
                    body: quote.text
                })
            });
            
            if (!response.ok) {
                console.error('Failed to sync quote:', quote);
            }
        }

        // Merge server and local quotes
        if (serverQuotes.length > 0) {
            quotes = mergeQuotes(serverQuotes, quotes);
            saveToLocalStorage();
            populateCategories();
            filterQuotes();
        }
        
        showNotification('Quotes synced successfully!');
    } catch (error) {
        console.error('Sync failed:', error);
        showNotification('Failed to sync quotes', 'error');
    }
}

// Update initialize function
function initialize() {
    loadFromLocalStorage();
    populateCategories();
    showRandomQuote();
    
    // Initial sync and set up periodic sync
    syncQuotes();
    setInterval(syncQuotes, 30000); // Sync every 30 seconds
}

// Add category filter event listener
categoryFilter.addEventListener('change', showRandomQuote);

// Event Listeners
generateBtn.addEventListener('click', showRandomQuote);

// Start the application
initialize();