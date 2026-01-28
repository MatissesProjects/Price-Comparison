const fs = require('fs');
const path = require('path');

// Mock Environment
const storageData = {};
global.window = { location: { href: 'http://test.com/menu' } };

// Mock DOM with multiple items
const mockItems = [
    {
        name: 'Blue Dream Cartridge',
        brand: 'Old Pal',
        price: '$35',
        category: 'Vapes'
    },
    {
        name: 'Lemon Cherry Gelato',
        brand: 'STIIIZY',
        price: '$31',
        category: 'Flower'
    },
    {
        name: 'Dispo Vape Pen',
        brand: 'Generic',
        price: '$20',
        category: 'Extract'
    }
];

global.document = {
    getElementById: () => null,
    querySelectorAll: (selector) => {
        if (selector === '.esxr620, [data-e2eid="product-image-container"]') {
            return mockItems.map((item, idx) => ({
                hasAttribute: () => false,
                closest: () => null,
                parentElement: { parentElement: null },
                querySelector: (s) => {
                    if (s === '[data-e2eid="productCardName"]') return { textContent: item.name };
                    if (s === '.e1mku4dk9') return { textContent: item.brand };
                    if (s === 'button[aria-label="Add to bag"] span span, .e1qfw1ka4 span') return { textContent: item.price };
                    if (s === '.e1dcvvwe0') return { textContent: item.category };
                    return null;
                }
            }));
        }
        return [];
    },
    body: {}
};

global.chrome = {
    storage: { local: { set: (data, cb) => { Object.assign(storageData, data); if (cb) cb(); } } },
    runtime: { lastError: null, onMessage: { addListener: () => {} } }
};
global.MutationObserver = class { observe() {} };

console.log('Running Vape Detection Test (Green Phase)...');
const contentScript = fs.readFileSync(path.join(__dirname, '../src/content.js'), 'utf8');

try {
    eval(contentScript);
    
    setTimeout(() => {
        const items = storageData.latest_menu.items;
        
        const cartridge = items.find(i => i.name.includes('Cartridge'));
        const flower = items.find(i => i.name.includes('Gelato'));
        const dispo = items.find(i => i.name.includes('Dispo'));

        let failed = false;
        
        if (!cartridge || cartridge.type !== 'vape') {
            console.error('FAIL: "Cartridge" not identified as vape.', cartridge);
            failed = true;
        }
        
        if (!dispo || dispo.type !== 'vape') {
            console.error('FAIL: "Dispo Vape Pen" not identified as vape.', dispo);
            failed = true;
        }

        if (!flower || flower.type === 'vape') {
            console.error('FAIL: "Flower" incorrectly identified as vape.', flower);
            failed = true;
        }

        if (failed) {
            console.log('TEST FAILED.');
            process.exit(1);
        } else {
            console.log('PASS: Vape detection verified.');
            process.exit(0);
        }
    }, 100);
} catch (e) {
    console.error('Script error:', e);
    process.exit(1);
}