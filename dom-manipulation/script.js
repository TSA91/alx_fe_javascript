// Mock API endpoint
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Function to fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return data.map(item => ({
            id: item.id,
            text: item.title,
            category: 'Server Quote'
        }));
    } catch (error) {
        displayNotification('Error fetching quotes from server', 'error');
        return [];
    }
}

// Function to post quote to server
async function postToServer(quote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1,
            }),
        });
        const result = await response.json();
        displayNotification('Quote successfully posted to server', 'success');
        return result;
    } catch (error) {
        displayNotification('Error posting quote to server', 'error');
        return null;
    }
}

// Function to sync quotes
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = JSON.parse(localStorage.getItem('quotes') || '[]');

    // Check for conflicts
    const conflicts = detectConflicts(localQuotes, serverQuotes);

    if (conflicts.length > 0) {
        handleConflicts(conflicts, localQuotes, serverQuotes);
    } else {
        // Merge and update local storage
        const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);
        localStorage.setItem('quotes', JSON.stringify(mergedQuotes));
        displayNotification('Quotes synchronized successfully', 'success');
    }
}

// Function to detect conflicts
function detectConflicts(localQuotes, serverQuotes) {
    return serverQuotes.filter(serverQuote => 
        localQuotes.some(localQuote => 
            localQuote.id === serverQuote.id && 
            localQuote.text !== serverQuote.text
        )
    );
}

// Function to handle conflicts
function handleConflicts(conflicts, localQuotes, serverQuotes) {
    const conflictContainer = document.getElementById('conflictContainer');
    conflictContainer.innerHTML = `
        <div class="conflict-alert">
            <h3>Conflicts Detected</h3>
            ${conflicts.map(conflict => `
                <div class="conflict-item">
                    <p>Server version: ${conflict.text}</p>
                    <p>Local version: ${localQuotes.find(q => q.id === conflict.id).text}</p>
                    <button onclick="resolveConflict(${conflict.id}, 'server')">Use Server Version</button>
                    <button onclick="resolveConflict(${conflict.id}, 'local')">Keep Local Version</button>
                </div>
            `).join('')}
        </div>
    `;
    conflictContainer.style.display = 'block';
}

// Function to merge quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    serverQuotes.forEach(serverQuote => {
        if (!mergedQuotes.some(localQuote => localQuote.id === serverQuote.id)) {
            mergedQuotes.push(serverQuote);
        }
    });
    return mergedQuotes;
}

// Function to display notifications
function displayNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Function to start periodic sync
function startPeriodicSync() {
    // Sync every 5 minutes
    setInterval(syncQuotes, 300000);
    // Initial sync
    syncQuotes();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create notification and conflict containers if they don't exist
    if (!document.getElementById('notification')) {
        const notificationDiv = document.createElement('div');
        notificationDiv.id = 'notification';
        notificationDiv.className = 'notification';
        document.body.appendChild(notificationDiv);
    }

    if (!document.getElementById('conflictContainer')) {
        const conflictDiv = document.createElement('div');
        conflictDiv.id = 'conflictContainer';
        conflictDiv.className = 'conflict-container';
        document.body.appendChild(conflictDiv);
    }

    // Start periodic sync
    startPeriodicSync();
});

// Add necessary CSS
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        border-radius: 5px;
        display: none;
        z-index: 1000;
    }

    .notification.success {
        background-color: #4CAF50;
        color: white;
    }

    .notification.error {
        background-color: #f44336;
        color: white;
    }

    .conflict-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: none;
        z-index: 1000;
    }

    .conflict-item {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
`;
document.head.appendChild(style);