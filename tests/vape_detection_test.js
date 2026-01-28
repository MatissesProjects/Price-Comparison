const fs = require('fs');
const path = require('path');

// Mock Environment
const storageData = {};
global.window = { location: { href: 'https://www.eaze.com/menu' } };

// Mock DOM with brand-specific test cases
const mockItems = [
    // Brand: Surplus (Should be Vape)
    { name: 'Watermelon', brand: 'Surplus', price: '$20', category: 'Unknown', thc: '80% THC' },
    
    // Brand: Allswell (Should be Vape)
    { name: 'Berry Gelato', brand: 'Allswell', price: '$25', category: 'Unknown', thc: '75% THC' },
    
    // Brand: Punch Edibles (Should be Vape per user)
    { name: 'Punch Extract', brand: 'Punch Edibles', price: '$40', category: 'Extract', thc: '90% THC' },

    // Brand: Circles (High THC -> Vape)
    { name: 'High Potency', brand: 'Circles', price: '$30', category: 'Unknown', thc: '85% THC' },
    
    // Brand: Circles (Low THC -> Not Vape)
    { name: 'Low Potency Flower', brand: 'Circles', price: '$15', category: 'Flower', thc: '24% THC' }
];

global.document = {
    getElementById: () => null,
    querySelectorAll: (selector) => {
        if (selector === '.esxr620, [data-e2eid="product-image-container"]') {
            return mockItems.map((item, idx) => ({
                hasAttribute: () => false,
                closest: () => null,
                parentElement: { parentElement: null },
                querySelectorAll: (s) => {
                    if (s === 'p, div, span') {
                        return [
                            { textContent: item.name },
                            { textContent: item.brand },
                            { textContent: item.price },
                            { textContent: item.category },
                            { textContent: item.thc }
                        ];
                    }
                    return [];
                },
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
    runtime: { id: 'test-id', lastError: null, onMessage: { addListener: () => {} } }
};
global.MutationObserver = class { 
    constructor() {
        global.observer = this;
    }
    observe() {} 
    disconnect() {}
};

console.log('Running Advanced Vape Detection Test (Red Phase)...');
const contentScript = fs.readFileSync(path.join(__dirname, '../src/content.js'), 'utf8');

try {
    eval(contentScript);
    
    setTimeout(() => {
        const items = storageData.latest_menu.items;
        
        const surplus = items.find(i => i.brand === 'Surplus');
        const allswell = items.find(i => i.brand === 'Allswell');
        const punch = items.find(i => i.brand === 'Punch Edibles');
        const circlesVape = items.find(i => i.brand === 'Circles' && i.name === 'High Potency');
        const circlesFlower = items.find(i => i.brand === 'Circles' && i.name === 'Low Potency Flower');

        let failed = false;
        
        if (surplus.type !== 'vape') { console.error('FAIL: Surplus not identified as vape.'); failed = true; }
        if (allswell.type !== 'vape') { console.error('FAIL: Allswell not identified as vape.'); failed = true; }
        if (punch.type !== 'vape') { console.error('FAIL: Punch Edibles not identified as vape.'); failed = true; }
        if (circlesVape.type !== 'vape') { console.error('FAIL: High THC Circles not identified as vape.'); failed = true; }
        if (circlesFlower.type === 'vape') { console.error('FAIL: Low THC Circles incorrectly identified as vape.'); failed = true; }

        if (failed) {
            console.log('TEST FAILED.');
            process.exit(1);
        } else {
            console.log('PASS: Advanced vape detection verified.');
            process.exit(0);
        }
    }, 100);
} catch (e) {
    console.error('Script error:', e);
    process.exit(1);
}
