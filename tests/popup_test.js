const fs = require('fs');
const path = require('path');

// Mock DOM
const dom = {
    'status-indicator': { textContent: '', style: {} },
    'refresh-btn': { addEventListener: () => {} },
    'tab-menu': { classList: { add: () => {}, remove: () => {} }, addEventListener: () => {} },
    'tab-carts': { classList: { add: () => {}, remove: () => {} }, addEventListener: (e, cb) => global.clickCartsTab = cb },
    'view-menu': { classList: { add: () => {}, remove: () => {} } },
    'view-carts': { classList: { add: () => {}, remove: () => {} } },
    'menu-list': { innerHTML: '', appendChild: (el) => { if(el.className==='menu-item') global.lastMenuItem = el; } },
    'cart-list': { innerHTML: '', appendChild: () => {} },
    'menu-search': { value: '', addEventListener: () => {} },
    'new-cart-name': { value: '' },
    'create-cart-btn': { addEventListener: (e, cb) => global.clickCreateCart = cb },
    
    // Modal
    'cart-modal': { classList: { add: () => {}, remove: () => {} } },
    'modal-item-name': { textContent: '' },
    'modal-cart-list': { innerHTML: '', appendChild: (el) => global.lastModalOption = el },
    'modal-cancel': { addEventListener: () => {} }
};

global.document = {
    getElementById: (id) => dom[id] || { addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } },
    createElement: (tag) => ({ 
        className: '', 
        innerHTML: '', 
        textContent: '', 
        appendChild: () => {}, 
        addEventListener: (e, cb) => { 
            // Capture click on "Add" button
            if (e === 'click' && tag === 'button') global.clickAddBtn = cb; 
            // Capture click on modal option
            if (e === 'click' && tag === 'div') global.clickModalOption = cb;
        } 
    })
};

// Mock Storage & PriceStorage
let storageData = {
    latest_menu: {
        timestamp: new Date().toISOString(),
        items: [{ id: 'p1', name: 'Test Weed', price: 50, brand: 'BrandX' }]
    },
    carts: [{ id: 'c1', name: 'My Cart', items: [] }]
};

global.chrome = {
    storage: {
        local: {
            get: (keys, cb) => {
                const res = {};
                keys.forEach(k => res[k] = storageData[k]);
                cb(res);
            }
        }
    },
    tabs: { query: (q, cb) => cb([]) },
    runtime: { lastError: null }
};

// Mock PriceStorage on window
let addedToCart = false;
global.window = {
    PriceStorage: {
        getCarts: async () => storageData.carts || [],
        createCart: async (name) => {
            const carts = storageData.carts || [];
            carts.push({ id: 'c2', name, items: [] });
            storageData.carts = carts;
        },
        addToCart: async (cartId, productId) => {
            if (cartId === 'c1' && productId === 'p1') {
                addedToCart = true;
            }
        }
    }
};

// Load Script
const popupScript = fs.readFileSync(path.join(__dirname, '../src/popup/popup.js'), 'utf8');

console.log('Running Popup UI Interaction Tests...');

// Run script
eval(popupScript);

// Test Flow
setTimeout(() => {
    // 1. Check if Menu Item rendered (by side effect of global.lastMenuItem)
    if (global.lastMenuItem) {
        console.log('PASS: Menu item rendered.');
        
        // 2. Click "Add" button on the item
        if (global.clickAddBtn) {
            global.clickAddBtn();
            
            // Wait for modal to render options
            setTimeout(() => {
                // 3. Click the cart option in modal
                if (global.lastModalOption && global.clickModalOption) {
                    global.clickModalOption().then(() => {
                        // 4. Verify addToCart called
                        if (addedToCart) {
                            console.log('PASS: Item added to cart via UI.');
                            process.exit(0);
                        } else {
                            console.error('FAIL: addToCart not called or params incorrect.');
                            process.exit(1);
                        }
                    });
                } else {
                    console.error('FAIL: Modal options not rendered.');
                    process.exit(1);
                }
            }, 50);
        } else {
            console.error('FAIL: Add button listener not captured.');
            process.exit(1);
        }
    } else {
        console.error('FAIL: Menu list empty.');
        process.exit(1);
    }
}, 100);
