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

// Search
const menuSearch = document.getElementById('menu-search');
let currentMenuItems = [];
let currentCategory = 'all';

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
            
            currentMenuItems = items;
            filterAndRenderMenu();
        } else {
            console.log('No data found in storage.');
            statusIndicator.textContent = 'Idle';
            menuList.innerHTML = '<p class="empty-state">No menu data captured yet. Visit Eaze.com/menu to start.</p>';
        }
    });
}

// Filter Logic

const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update UI
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update State
        currentCategory = btn.getAttribute('data-category');
        filterAndRenderMenu();
    });
});

function filterAndRenderMenu() {
    const query = menuSearch.value.toLowerCase();
    const filteredItems = currentMenuItems.filter(item => {
        // Category Filter
        const matchesCategory = currentCategory === 'all' || (item.type && item.type.toLowerCase() === currentCategory);
        
        // Search Filter
        const matchesSearch = (
            item.name.toLowerCase().includes(query) ||
            item.brand.toLowerCase().includes(query) ||
            (item.type && item.type.toLowerCase().includes(query)) ||
            (item.category && item.category.toLowerCase().includes(query))
        );

        return matchesCategory && matchesSearch;
    });
    renderMenu(filteredItems);
}

menuSearch.addEventListener('input', filterAndRenderMenu);

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
    if (!window.PriceStorage || !window.PriceEngine) return;

    const carts = await window.PriceStorage.getCarts();
    const result = await new Promise(r => chrome.storage.local.get(['latest_menu'], r));
    const products = result.latest_menu ? result.latest_menu.items : [];
    
    cartList.innerHTML = '';

    if (carts.length === 0) {
        cartList.innerHTML = '<p class="empty-state">No carts created yet.</p>';
        return;
    }

    // Calculate totals and average price for all carts first to find the best value
    const cartTotals = carts.map(cart => {
        const totals = window.PriceEngine.calculateCartTotal(cart, products);
        return {
            cart,
            totals,
            avgPrice: totals.itemCount > 0 ? totals.total / totals.itemCount : Infinity
        };
    });

    // Find min average price among non-empty carts
    const validCarts = cartTotals.filter(ct => ct.totals.itemCount > 0);
    const minAvgPrice = validCarts.length > 0 ? Math.min(...validCarts.map(ct => ct.avgPrice)) : Infinity;

    cartTotals.forEach(({ cart, totals, avgPrice }) => {
        const isBestValue = validCarts.length > 1 && avgPrice === minAvgPrice && totals.total > 0;
        
        const el = document.createElement('div');
        el.className = `cart-item ${isBestValue ? 'best-value' : ''}`;
        
        let itemsHtml = '';
        if (cart.items.length > 0) {
            itemsHtml = '<div class="cart-items-list">';
            cart.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const promo = window.PriceEngine.parsePromo(product.promo_code);
                    const itemDiscount = promo.type === 'percent' ? (product.price * promo.value) : promo.value;
                    
                    itemsHtml += `
                        <div class="cart-product-row">
                            <div class="product-main">
                                <span class="product-name">${product.name}</span>
                                <span class="product-price">$${product.price.toFixed(2)} x ${item.quantity}</span>
                            </div>
                            <div class="product-meta">
                                ${product.promo_code ? `<span class="product-promo">${product.promo_code}</span>` : ''}
                                <button class="qty-btn dec-btn" data-cart-id="${cart.id}" data-product-id="${product.id}">-</button>
                                <button class="qty-btn inc-btn" data-cart-id="${cart.id}" data-product-id="${product.id}">+</button>
                                <button class="remove-item-btn" data-cart-id="${cart.id}" data-product-id="${product.id}" title="Remove item">&times;</button>
                            </div>
                        </div>
                    `;
                }
            });
            itemsHtml += '</div>';
        }

        let totalsHtml = '';
        if (totals.itemCount > 0) {
            totalsHtml = `
                <div class="cart-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$${totals.subtotal.toFixed(2)}</span>
                    </div>
                    ${totals.discount > 0 ? `
                    <div class="total-row discount">
                        <span>Discount:</span>
                        <span>-$${totals.discount.toFixed(2)}</span>
                    </div>` : ''}
                    <div class="total-row tax">
                        <span>Taxes & Fees (43.75%):</span>
                        <span>$${totals.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>Estimated Total:</span>
                        <span>$${totals.total.toFixed(2)}</span>
                    </div>
                </div>
            `;
        } else {
            totalsHtml = '<p class="empty-state">Cart is empty</p>';
        }

        el.innerHTML = `
            <div class="cart-header">
                <span class="cart-name" contenteditable="true" title="Click to rename">${cart.name}</span>
                ${isBestValue ? '<span class="badge">Best Value</span>' : ''}
                <span class="cart-count">${totals.itemCount} items</span>
            </div>
            ${itemsHtml}
            ${totalsHtml}
        `;

        // Handle renaming
        const nameEl = el.querySelector('.cart-name');
        nameEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nameEl.blur();
            }
        });

        nameEl.addEventListener('blur', async () => {
            const newName = nameEl.textContent.trim();
            if (newName && newName !== cart.name) {
                await window.PriceStorage.renameCart(cart.id, newName);
                renderCarts();
            } else {
                nameEl.textContent = cart.name; // Reset if empty
            }
        });

        // Add event listeners to qty buttons
        el.querySelectorAll('.inc-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const cartId = btn.getAttribute('data-cart-id');
                const productId = btn.getAttribute('data-product-id');
                await window.PriceStorage.addToCart(cartId, productId, 1);
                renderCarts();
            });
        });

        el.querySelectorAll('.dec-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const cartId = btn.getAttribute('data-cart-id');
                const productId = btn.getAttribute('data-product-id');
                await window.PriceStorage.decrementCartItem(cartId, productId);
                renderCarts();
            });
        });

        // Add event listeners to remove buttons
        el.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const cartId = btn.getAttribute('data-cart-id');
                const productId = btn.getAttribute('data-product-id');
                await window.PriceStorage.removeFromCart(cartId, productId);
                renderCarts();
            });
        });

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