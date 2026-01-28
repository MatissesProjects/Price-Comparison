console.log('Popup script loaded.');

const statusIndicator = document.getElementById('status-indicator');
const debugData = document.getElementById('debug-data');
const refreshBtn = document.getElementById('refresh-btn');

function updatePopup(shouldRefetch = false) {
    if (shouldRefetch) {
        statusIndicator.textContent = 'Refetching...';
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'REFRESH_DATA' }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.log('Could not send message to content script (likely not loaded on this page).');
                    } else {
                        console.log('Refresh command sent:', response);
                    }
                    // Wait a bit for extraction to happen, then read storage
                    setTimeout(readStorage, 1000);
                });
            } else {
                readStorage();
            }
        });
    } else {
        readStorage();
    }
}

function readStorage() {
    chrome.storage.local.get(['latest_menu'], (result) => {
        if (result.latest_menu) {
            console.log('Data retrieved from storage:', result.latest_menu);
            const { timestamp, items } = result.latest_menu;
            statusIndicator.textContent = 'Data Captured';
            statusIndicator.style.backgroundColor = '#d1fae5';
            statusIndicator.style.color = '#065f46';
            
            debugData.value = `Last captured: ${new Date(timestamp).toLocaleString()}\n` +
                             `Items found: ${items.length}\n\n` +
                             JSON.stringify(items, null, 2);
        } else {
            console.log('No data found in storage.');
            statusIndicator.textContent = 'Idle';
            debugData.value = 'No menu data captured yet. Visit Eaze.com/menu to start.';
        }
    });
}

refreshBtn.addEventListener('click', () => updatePopup(true));

// Initial load (passive read)
updatePopup(false);