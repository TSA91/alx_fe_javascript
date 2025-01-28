// Mock API URL (using JSONPlaceholder)
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Function to fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Convert server data to quote format
        return data.map(item => ({
            id: item.id,
            text: item.title,
            category: 'Server Quote'
        })).slice(0, 5); // Limit to 5 quotes for demo
    } catch (error) {
        showNotification('Error fetching quotes: ' + error.message, 'error');
        return [];
    }
}

// Function to post new quote to server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        const data = await response.json();
        showNotification('Quote successfully posted to server', 'success');
        return data;
    } catch (error) {
        showNotification('Error posting quote: ' + error.message, 'error');
        return null;
    }
}

// Function to sync quotes between local and server
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');

    // Check for conflicts
    const conflicts = findConflicts(localQuotes, serverQuotes);
    
    if (conflicts.length > 0) {
        handleConflicts(conflicts);
    } else {
        // Merge quotes if no conflicts
        const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);
        localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
        showNotification('Quotes synchronized successfully', 'success');
    }
}

// Function to find conflicts between local and server quotes
function findConflicts(localQuotes, serverQuotes) {
    return serverQuotes.filter(serverQuote => 
        localQuotes.some(localQuote => 
            localQuote.id === serverQuote.id && 
            localQuote.text !== serverQuote.text
        )
    );
}

// Function to handle conflicts
function handleConflicts(conflicts) {
    const conflictContainer = document.getElementById('conflictContainer');
    conflictContainer.innerHTML = `
        <div class="conflict-notification">
            <h3>Conflicts Detected</h3>
            ${conflicts.map(conflict => `
                <div class="conflict-item">
                    <p>Server version: ${conflict.text}</p>
                    <button onclick="resolveConflict(${conflict.id}, 'server')">Use Server Version</button>
                    <button onclick="resolveConflict(${conflict.id}, 'local')">Keep Local Version</button>
                </div>
            `).join('')}
        </div>
    `;
    conflictContainer.style.display = 'block';
}

// Function to merge quotes without conflicts
function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        if (!mergedQuotes.some(localQuote => localQuote.id === serverQuote.id)) {
            mergedQuotes.push(serverQuote);
        }
    });
    
    return mergedQuotes;
}

// Function to show notifications
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Function to resolve conflicts
function resolveConflict(quoteId, version) {
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');
    const serverQuotes = JSON.parse(sessionStorage.getItem('serverQuotes') || '[]');
    
    if (version === 'server') {
        const serverQuote = serverQuotes.find(quote => quote.id === quoteId);
        const index = localQuotes.findIndex(quote => quote.id === quoteId);
        if (index !== -1) {
            localQuotes[index] = serverQuote;
        }
    }
    
    localStorage.setItem('quotes', JSON.stringify(localQuotes));
    document.getElementById('conflictContainer').style.display = 'none';
    showNotification('Conflict resolved', 'success');
}

// Set up periodic sync
function setupPeriodicSync() {
    // Sync every 5 minutes
    setInterval(syncQuotes, 300000);
    
    // Initial sync
    syncQuotes();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupPeriodicSync();
    
    // Add necessary HTML elements for notifications and conflicts
    document.body.insertAdjacentHTML('beforeend', `
        <div id="notification" class="notification" style="display: none;"></div>
        <div id="conflictContainer" class="conflict-container" style="display: none;"></div>
    `);
});