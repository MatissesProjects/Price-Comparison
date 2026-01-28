const fs = require('fs');
const path = require('path');

// Mock Environment
const storageData = {};
global.window = {
    location: { href: 'http://test.com/menu' }
};

// Simple DOM Mock for Node
global.document = {
    getElementById: (id) => null, // Skip JSON strategy for this test
    querySelectorAll: (selector) => {
        if (selector === '.esxr620, [data-e2eid="product-image-container"]') {
            return [{
                hasAttribute: (attr) => attr === 'data-e2eid' ? false : false,
                querySelector: (s) => {
                    if (s === '[data-e2eid="productCardName"]') return { textContent: 'Lemon Cherry Gelato' };
                    if (s === '.e1mku4dk9') return { textContent: 'STIIIZY' };
                    if (s === 'button[aria-label="Add to bag"] span span, .e1qfw1ka4 span') return { textContent: '$31' };
                    if (s === 'a[href*="/products/"]') return { getAttribute: () => '/products/test/cid/uuid-123' };
                    if (s === '.e1dcvvwe0') return { textContent: 'HYBRID' };
                    if (s === 'div[data-e2eid="tag"] span') return { textContent: 'USE CODE 30OFF' };
                    return null;
                }
            }];
        }
        return [];
    },
    body: {}
};

global.chrome = {
    storage: {
        local: {
            set: (data, cb) => {
                Object.assign(storageData, data);
                if (cb) cb();
            }
        }
    },
    runtime: { 
        lastError: null,
        onMessage: { addListener: () => {} } 
    }
};

global.MutationObserver = class {
    observe() {}
};

// Load and Run Content Script
console.log('Running Content Script Test (DOM Strategy)...');
const contentScript = fs.readFileSync(path.join(__dirname, '../src/content.js'), 'utf8');

try {
    eval(contentScript);
    
    setTimeout(() => {
        if (!storageData.latest_menu) {
            console.error('FAIL: No data saved to storage.');
            process.exit(1);
        }
        
        const item = storageData.latest_menu.items[0];
        console.log('Extracted item:', item);
        
        if (item.name === 'Lemon Cherry Gelato' && 
            item.price === 31 && 
            item.brand === 'STIIIZY' &&
            item.promo_code === 'USE CODE 30OFF') {
            console.log('PASS: Data extraction successful for live Eaze structure.');
            process.exit(0);
        } else {
            console.error('FAIL: Incorrect extracted data.', item);
            process.exit(1);
        }
    }, 100);
    
} catch (e) {
    console.error('FAIL: Script execution error:', e);
    process.exit(1);
}