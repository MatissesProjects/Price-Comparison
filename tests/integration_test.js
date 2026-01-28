const fs = require('fs');
const path = require('path');

// --- SHARED MOCKS ---
let chromeStorage = {};
const listeners = {};

global.chrome = {
    storage: {
        local: {
            set: (data, cb) => {
                console.log('[ChromeStorage] Setting data:', Object.keys(data));
                Object.assign(chromeStorage, data);
                if (cb) cb();
            },
            get: (keys, cb) => {
                console.log('[ChromeStorage] Getting data:', keys);
                const res = {};
                keys.forEach(k => res[k] = chromeStorage[k]);
                cb(res);
            }
        }
    },
    runtime: { lastError: null }
};

// --- CONTENT SCRIPT MOCK ---
global.window = { location: { href: 'http://test.com/menu' } };
global.document = {
    // Return empty for generic calls, we'll manually inject data for the test
    getElementById: () => null,
    querySelectorAll: () => [],
    body: {}
};
global.MutationObserver = class { observe() {} };

// --- POPUP MOCK ---
const popupDom = {
    'status-indicator': { textContent: '', style: {} },
    'debug-data': { value: '' },
    'refresh-btn': { addEventListener: () => {} }
};

// --- TEST FLOW ---

async function runIntegrationTest() {
    console.log('--- STARTING INTEGRATION TEST ---');

    // 1. Load Content Script
    console.log('\n1. Loading Content Script...');
    const contentScript = fs.readFileSync(path.join(__dirname, '../src/content.js'), 'utf8');
    
    // Inject Mock Data logic directly into the environment for the content script to find
    // We override querySelectorAll momentarily to simulate finding the card
    const originalQSA = global.document.querySelectorAll;
    global.document.querySelectorAll = (selector) => {
        if (selector.includes('.esxr620')) {
            return [{
                hasAttribute: () => false,
                closest: () => null,
                parentElement: { parentElement: null },
                querySelector: (s) => {
                    if (s === '[data-e2eid="productCardName"]') return { textContent: 'Integration Weed' };
                    if (s === 'button[aria-label="Add to bag"] span span, .e1qfw1ka4 span') return { textContent: '$50' };
                    return null;
                }
            }];
        }
        return [];
    };

    eval(contentScript);
    global.document.querySelectorAll = originalQSA; // Restore

    // Wait for storage to populate
    await new Promise(r => setTimeout(r, 100));

    if (!chromeStorage.latest_menu) {
        console.error('FAIL: Content script did not save to storage.');
        process.exit(1);
    }
    console.log('PASS: Content script saved data.');

    // 2. Load Popup Script
    console.log('\n2. Loading Popup Script...');
    // Swap global document to popup dom
    const originalGetEl = global.document.getElementById;
    global.document.getElementById = (id) => popupDom[id];

    const popupScript = fs.readFileSync(path.join(__dirname, '../src/popup/popup.js'), 'utf8');
    eval(popupScript);

    // Wait for popup to read storage
    await new Promise(r => setTimeout(r, 100));

    // 3. Verify Output
    console.log('\n3. Verifying Output...');
    console.log('Status:', popupDom['status-indicator'].textContent);
    console.log('Debug Data:', popupDom['debug-data'].value);

    if (popupDom['status-indicator'].textContent === 'Data Captured' && 
        popupDom['debug-data'].value.includes('Integration Weed')) {
        console.log('\nPASS: Full flow verified!');
        process.exit(0);
    } else {
        console.error('\nFAIL: Popup did not display extracted data.');
        process.exit(1);
    }
}

runIntegrationTest();
