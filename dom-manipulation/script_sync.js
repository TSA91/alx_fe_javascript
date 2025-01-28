// Configuration
const CONFIG = {
    SYNC_INTERVAL: 30000, // 30 seconds
    API_URL: 'https://jsonplaceholder.typicode.com/posts', // Mock API endpoint
    VERSION_KEY: 'quoteVersion'
};

// State management
let quotes = [];
let syncInProgress = false;
let lastSyncTime = null;

// DOM Elements
const syncIndicator = document.getElementById('syncIndicator');
const syncMessage = document.getElementById('syncMessage');
const conflictDialog = document.getElementById('conflictDialog');

// Initialize the application
async function init() {
    loadLocalQuotes();
    startAutoSync();
    await performInitialSync();
}

// Load quotes from local storage
function loadLocalQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    quotes = storedQuotes ? JSON.parse(storedQuotes) : [];
    updateDisplay();
}

// Save quotes to local storage
function saveLocalQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    localStorage.setItem(CONFIG.VERSION_KEY, Date.now().toString());
}

// Update the quote display
function updateDisplay() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quotes.length > 0) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteDisplay.innerHTML = `
            <p>"${randomQuote.text}"</p>
            <p class="category">Category: ${randomQuote.category}</p>
        `;
    } else {
        quoteDisplay.innerHTML = '<p>No quotes available</p>';
    }
}

// Sync status indicators
function updateSyncStatus(status, message) {
    syncIndicator.className = `sync-indicator ${status}`;
    syncMessage.textContent = message;
}

// Start automatic sync
function startAutoSync() {
    setInterval(async () => {
        if (!syncInProgress) {
            await syncWithServer();
        }
    }, CONFIG.SYNC_INTERVAL);
}

// Manual sync trigger
async function manualSync() {
    if (!syncInProgress) {
        await syncWithServer();
    }
}

// Main sync function
async function syncWithServer() {
    syncInProgress = true;
    updateSyncStatus('syncing', 'Syncing...');

    try {
        // Simulate server fetch
        const response = await fetch(CONFIG.API_URL);
        const serverQuotes = await response.json();

        // Convert server data to our format
        const formattedServerQuotes = serverQuotes.map(sq => ({
            text: sq.title,
            category: 'Server',
            id: sq.id
        })).slice(0, 5); // Limit to 5 quotes for demo

        // Check for conflicts
        const conflicts = detectConflicts(formattedServerQuotes);
        
        if (conflicts.length > 0) {
            showConflictDialog(conflicts);
        } else {
            mergeQuotes(formattedServerQuotes);
        }

        updateSyncStatus('success', 'Last synced: ' + new Date().toLocaleTimeString());
    } catch (error) {
        updateSyncStatus('error', 'Sync failed: ' + error.message);
    } finally {
        syncInProgress = false;
    }
}

// Detect conflicts between local and server data
function detectConflicts(serverQuotes) {
    return serverQuotes.filter(sq => 
        quotes.some(lq => lq.id === sq.id && lq.text !== sq.text)
    );
}

// Show conflict resolution dialog
function showConflictDialog(conflicts) {
    const content = conflicts.map(conflict => `
        <div class="conflict-item">
            <p>Server version: "${conflict.text}"</p>
            <p>Local version: "${quotes.find(q => q.id === conflict.id).text}"</p>
        </div>
    `).join('');

    document.getElementById('conflictContent').innerHTML = content;
    conflictDialog.classList.remove('hidden');
}

// Resolve conflicts using local data
function useLocal() {
    conflictDialog.classList.add('hidden');
    updateSyncStatus('success', 'Using local version');
}

// Resolve conflicts using server data
function useServer() {
    conflictDialog.classList.add('hidden');
    syncWithServer();
}

// Merge quotes without conflicts
function mergeQuotes(serverQuotes) {
    const mergedQuotes = [...quotes];
    
    serverQuotes.forEach(sq => {
        const localIndex = mergedQuotes.findIndex(lq => lq.id === sq.id);
        if (localIndex === -1) {
            mergedQuotes.push(sq);
        }
    });

    quotes = mergedQuotes;
    saveLocalQuotes();
    updateDisplay();
}

// Add new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value;
    const category = document.getElementById('newQuoteCategory').value;

    if (!text || !category) {
        alert('Please fill in both fields');
        return;
    }

    const newQuote = {
        id: Date.now(),
        text,
        category
    };

    quotes.push(newQuote);
    saveLocalQuotes();
    updateDisplay();

    // Clear inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Initial sync when page loads
async function performInitialSync() {
    await syncWithServer();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);