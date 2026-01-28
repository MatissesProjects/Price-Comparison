// Simple Test Harness for Pure JS
const results = [];

// Mock Chrome API
window.chrome = {
    storage: {
        local: {
            data: {},
            set: function(obj, callback) {
                Object.assign(this.data, obj);
                if (callback) callback();
            },
            get: function(keys, callback) {
                const result = {};
                keys.forEach(k => result[k] = this.data[k]);
                callback(result);
            }
        }
    },
    runtime: {
        lastError: null
    }
};

// Mock MutationObserver (noop for testing extraction)
window.MutationObserver = class {
    observe() {}
    disconnect() {}
};

// Assertion Helper
function assert(desc, condition) {
    const status = condition ? "PASS" : "FAIL";
    console.log(`[${status}] ${desc}`);
    results.push({ desc, status });
    
    // UI Feedback
    const el = document.createElement('div');
    el.textContent = `[${status}] ${desc}`;
    el.style.color = condition ? 'green' : 'red';
    document.body.appendChild(el);
}

// Test Suite
window.runTests = function() {
    console.log('Running tests...');
    
    // Wait a moment for content.js to execute its initial extraction
    setTimeout(() => {
        const stored = window.chrome.storage.local.data.latest_menu;
        
        assert('Storage should contain "latest_menu"', !!stored);
        
        if (stored) {
            assert('Data should have timestamp', !!stored.timestamp);
            assert('Data should have items array', Array.isArray(stored.items));
            assert('Should extract at least 2 items (from JSON)', stored.items.length >= 2);
            
            const lemonCherry = stored.items.find(i => i.name.includes('Lemon Cherry'));
            assert('Should extract "Lemon Cherry Gelato" with price 31', lemonCherry && lemonCherry.price === 31);
            assert('Should extract brand "STIIIZY"', lemonCherry && lemonCherry.brand === 'STIIIZY');
        } else {
            assert('CRITICAL: No data saved to storage', false);
        }

        // Summary
        const passed = results.filter(r => r.status === 'PASS').length;
        const total = results.length;
        console.log(`Tests Complete: ${passed}/${total} passed.`);
        
        const summary = document.createElement('h2');
        summary.textContent = `Tests Complete: ${passed}/${total} passed.`;
        document.body.prepend(summary);
    }, 500);
};

// Start tests after window load
window.addEventListener('load', window.runTests);
