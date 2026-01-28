console.log('Popup script loaded.');

const statusIndicator = document.getElementById('status-indicator');
const debugData = document.getElementById('debug-data');
const refreshBtn = document.getElementById('refresh-btn');

function updatePopup() {
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

refreshBtn.addEventListener('click', updatePopup);

// Initial load
updatePopup();