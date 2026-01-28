const fs = require('fs');
const path = require('path');

// Mock DOM
const dom = {
    'status-indicator': { textContent: '', style: {} },
    'debug-data': { value: '' },
    'refresh-btn': { addEventListener: () => {} },
    'tab-menu': { classList: { add: () => {}, remove: () => {} }, addEventListener: () => {} },
    'tab-carts': { classList: { add: () => {}, remove: () => {} }, addEventListener: (e, cb) => global.clickCartsTab = cb },
    'view-menu': { classList: { add: () => {}, remove: () => {} } },
    'view-carts': { classList: { add: () => {}, remove: () => {} } },
    'cart-list': { innerHTML: '', appendChild: () => {} },
    'new-cart-name': { value: '' },
    'create-cart-btn': { addEventListener: (e, cb) => global.clickCreateCart = cb }
};

global.document = {
    getElementById: (id) => dom[id] || { addEventListener: () => {}, classList: { add: () => {}, remove: () => {} } },
    createElement: () => ({ className: '', innerHTML: '' })
};

// Mock Storage & PriceStorage
let storageData = {};
global.chrome = {
    storage: {
        local: {
            get: (keys, cb) => {
                const res = {};
                keys.forEach(k => res[k] = storageData[k]);
                cb(res);
            },
            set: (data, cb) => {
                Object.assign(storageData, data);
                if (cb) cb();
            }
        }
    },
    tabs: { query: (q, cb) => cb([]) },
    runtime: { lastError: null }
};

// Mock PriceStorage on window
global.window = {
    PriceStorage: {
        getCarts: async () => storageData.carts || [],
        createCart: async (name) => {
            const carts = storageData.carts || [];
            carts.push({ id: '1', name, items: [] });
            storageData.carts = carts;
        }
    }
};

// Load Script
const popupScript = fs.readFileSync(path.join(__dirname, '../src/popup/popup.js'), 'utf8');

console.log('Running Popup UI Tests...');

// Run script
eval(popupScript);

// Test 1: Switch to Carts Tab
if (global.clickCartsTab) {
    global.clickCartsTab();
    // Verification would ideally check classList changes, but simpler to check side effect (render)
    setTimeout(() => {
        // Test 2: Create Cart
        if (global.clickCreateCart) {
            dom['new-cart-name'].value = 'Test Cart UI';
            global.clickCreateCart().then(() => {
                setTimeout(() => {
                    const carts = storageData.carts;
                    if (carts && carts.length > 0 && carts[0].name === 'Test Cart UI') {
                        console.log('PASS: Cart created via UI logic.');
                        process.exit(0);
                    } else {
                        console.error('FAIL: Cart not created.');
                        process.exit(1);
                    }
                }, 100);
            });
        } else {
            console.error('FAIL: Create button listener not hooked.');
            process.exit(1);
        }
    }, 100);
} else {
    console.error('FAIL: Tabs listener not hooked.');
    process.exit(1);
}