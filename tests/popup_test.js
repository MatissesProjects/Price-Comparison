const fs = require('fs');
const path = require('path');

// Mock DOM
const dom = {
    'status-indicator': { textContent: '', style: {} },
    'debug-data': { value: '' },
    'refresh-btn': { 
        addEventListener: (event, cb) => {
            if (event === 'click') global.triggerRefresh = cb;
        } 
    }
};

global.document = {
    getElementById: (id) => dom[id]
};

// Mock Storage & Tabs
let storageData = {};
let sentMessages = [];

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
    tabs: {
        query: (queryInfo, cb) => cb([{ id: 123 }]),
        sendMessage: (tabId, msg, cb) => {
            sentMessages.push({ tabId, msg });
            if (cb) cb({ status: 'ok' });
        }
    },
    runtime: { lastError: null }
};

// Helper to reset mocks
function resetMocks() {
    dom['status-indicator'].textContent = '';
    dom['status-indicator'].style = {};
    dom['debug-data'].value = '';
    storageData = {};
    sentMessages = [];
}

// Load Script
const popupScript = fs.readFileSync(path.join(__dirname, '../src/popup/popup.js'), 'utf8');

console.log('Running Popup Tests...');

// Test 1: Initial Load - No Data
resetMocks();
eval(popupScript);
setTimeout(() => {
    if (dom['status-indicator'].textContent === 'Idle' && 
        dom['debug-data'].value.includes('No menu data')) {
        console.log('PASS: Initial load (empty storage) correctly sets Idle status.');
    } else {
        console.error('FAIL: Initial load (empty storage) incorrect.');
        process.exit(1);
    }
}, 50);

// Test 2: Initial Load - With Data
setTimeout(() => {
    resetMocks();
    storageData = {
        latest_menu: {
            timestamp: new Date().toISOString(),
            items: [{ name: 'Test Item', price: 10 }]
        }
    };
    
    // Re-run update logic (simulate script reload or function call if exposed, 
    // but since it runs on load, we might need to trigger the refresh handler which calls the same function)
    if (global.triggerRefresh) {
        global.triggerRefresh();
        
        setTimeout(() => {
            // Check if message was sent
            if (sentMessages.length > 0 && sentMessages[0].msg.action === 'REFRESH_DATA') {
                console.log('PASS: Refresh button triggered REFRESH_DATA message.');
            } else {
                console.error('FAIL: Refresh button did not send message.', sentMessages);
                process.exit(1);
            }

            if (dom['status-indicator'].textContent === 'Data Captured' && 
                dom['debug-data'].value.includes('Test Item')) {
                console.log('PASS: Data display correctly updates from storage.');
            } else {
                console.error('FAIL: Data display incorrect.');
                console.log('Status:', dom['status-indicator'].textContent);
                console.log('Debug:', dom['debug-data'].value);
                process.exit(1);
            }
        }, 1100); // Wait > 1000ms for popup timeout
    } else {
        console.error('FAIL: Refresh handler not registered.');
        process.exit(1);
    }
}, 100);

// Final Success
setTimeout(() => {
    console.log('All Popup Tests Passed.');
    process.exit(0);
}, 1500);
