console.log('Popup script loaded.');

// DOM Elements
const statusIndicator = document.getElementById('status-indicator');
const refreshBtn = document.getElementById('refresh-btn');

// Tabs
const tabMenu = document.getElementById('tab-menu');
const tabCarts = document.getElementById('tab-carts');
const viewMenu = document.getElementById('view-menu');
const viewCarts = document.getElementById('view-carts');

// Lists
const menuList = document.getElementById('menu-list');
const cartList = document.getElementById('cart-list');

// Cart Form
const newCartName = document.getElementById('new-cart-name');
const createCartBtn = document.getElementById('create-cart-btn');

// Modal
const cartModal = document.getElementById('cart-modal');
const modalItemName = document.getElementById('modal-item-name');
const modalCartList = document.getElementById('modal-cart-list');
const modalCancel = document.getElementById('modal-cancel');

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
        renderCarts(); 
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
                        console.log('Could not send message to content script.');
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
            
            renderMenu(items);
        } else {
            console.log('No data found in storage.');
            statusIndicator.textContent = 'Idle';
            menuList.innerHTML = '<p class="empty-state">No menu data captured yet. Visit Eaze.com/menu to start.</p>';
        }
    });
}

function renderMenu(items) {
    menuList.innerHTML = '';
    if (items.length === 0) {
        menuList.innerHTML = '<p class="empty-state">No items found.</p>';
        return;
    }

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'menu-item';
        
        // Use textContent for safety
        const infoDiv = document.createElement('div');
        infoDiv.className = 'item-info';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'item-name';
        nameSpan.textContent = item.name;
        
        const metaSpan = document.createElement('span');
        metaSpan.className = 'item-meta';
        metaSpan.textContent = `$${item.price} • ${item.brand} • ${item.type || 'other'}`;
        
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(metaSpan);
        
        const addBtn = document.createElement('button');
        addBtn.className = 'add-btn';
        addBtn.textContent = 'Add';
        addBtn.addEventListener('click', () => openAddToCartModal(item));

        el.appendChild(infoDiv);
        el.appendChild(addBtn);
        menuList.appendChild(el);
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

// --- Modal Logic ---
async function openAddToCartModal(item) {
    if (!window.PriceStorage) return;
    const carts = await window.PriceStorage.getCarts();
    
    modalItemName.textContent = `Add "${item.name}" to:`;
    modalCartList.innerHTML = '';

    if (carts.length === 0) {
        modalCartList.innerHTML = '<p>No carts available. Create one first!</p>';
    } else {
        carts.forEach(cart => {
            const btn = document.createElement('div');
            btn.className = 'modal-cart-option';
            btn.textContent = cart.name;
            btn.addEventListener('click', async () => {
                await window.PriceStorage.addToCart(cart.id, item.id);
                // Flash success or close
                cartModal.classList.add('hidden');
                // Optional: switch to carts tab or show notification
                console.log(`Added ${item.name} to ${cart.name}`);
            });
            modalCartList.appendChild(btn);
        });
    }

    cartModal.classList.remove('hidden');
}

modalCancel.addEventListener('click', () => {
    cartModal.classList.add('hidden');
});

// Initial load
updatePopup(false);