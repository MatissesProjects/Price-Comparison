console.log('Popup script loaded.');

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const debugData = document.getElementById('debug-data');
const refreshBtn = document.getElementById('refresh-btn');

// Tabs
const tabMenu = document.getElementById('tab-menu');
const tabCarts = document.getElementById('tab-carts');
const viewMenu = document.getElementById('view-menu');
const viewCarts = document.getElementById('view-carts');

// Carts
const cartList = document.getElementById('cart-list');
const newCartName = document.getElementById('new-cart-name');
const createCartBtn = document.getElementById('create-cart-btn');

// --- Tab Logic ---
function switchTab(tab) {
    if (tab === 'menu') {
        tabMenu.classList.add('active');
        tabCarts.classList.remove('active');
        viewMenu.classList.remove('hidden');
        viewCarts.classList.add('hidden');
    } else {
        tabMenu.classList.remove('active');
        tabCarts.classList.add('active');
        viewMenu.classList.add('hidden');
        viewCarts.classList.remove('hidden');
        renderCarts(); // Refresh list when switching
    }
}

tabMenu.addEventListener('click', () => switchTab('menu'));
tabCarts.addEventListener('click', () => switchTab('carts'));

// --- Menu Data Logic ---
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

// --- Cart Logic ---
async function renderCarts() {
    if (!window.PriceStorage) return;

    const carts = await window.PriceStorage.getCarts();
    cartList.innerHTML = '';

    if (carts.length === 0) {
        cartList.innerHTML = '<p class="empty-state">No carts created yet.</p>';
        return;
    }

    carts.forEach(cart => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="cart-header">
                <span class="cart-name">${cart.name}</span>
                <span class="cart-count">${cart.items.length} items</span>
            </div>
        `;
        cartList.appendChild(el);
    });
}

createCartBtn.addEventListener('click', async () => {
    const name = newCartName.value.trim();
    if (!name) return;

    if (window.PriceStorage) {
        await window.PriceStorage.createCart(name);
        newCartName.value = '';
        renderCarts();
    }
});

// Initial load
updatePopup(false);
