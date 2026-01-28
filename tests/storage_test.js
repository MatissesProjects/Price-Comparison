const fs = require('fs');
const path = require('path');

// Mock Chrome Storage
let storage = {};
global.chrome = {
    storage: {
        local: {
            get: (keys, cb) => {
                const res = {};
                if (Array.isArray(keys)) {
                    keys.forEach(k => res[k] = storage[k]);
                } else {
                    res[keys] = storage[keys];
                }
                cb(res);
            },
            set: (data, cb) => {
                Object.assign(storage, data);
                if (cb) cb();
            }
        }
    },
    runtime: { lastError: null }
};

// Test Runner
async function runTests() {
    console.log('Running Storage Utility Tests (Green Phase)...');
    
    try {
        const Storage = require('../src/utils/storage.js');
        
        // Test Create Cart
        const newCart = await Storage.createCart('Test Cart');
        const carts = await Storage.getCarts();
        
        if (carts.length === 1 && carts[0].name === 'Test Cart') {
            console.log('PASS: Cart created.');
        } else {
            console.error('FAIL: Cart not created correctly.', carts);
            process.exit(1);
        }

        // Test Add to Cart
        await Storage.addToCart(newCart.id, 'prod_123');
        const updatedCarts = await Storage.getCarts();
        if (updatedCarts[0].items.some(i => i.productId === 'prod_123')) {
            console.log('PASS: Item added to cart.');
        } else {
            console.error('FAIL: Item not added to cart.', updatedCarts[0].items);
            process.exit(1);
        }

        // Test Multi-cart items
        const cart2 = await Storage.createCart('Cart 2');
        await Storage.addToCart(cart2.id, 'prod_123');
        const finalCarts = await Storage.getCarts();
        
        const inCart1 = finalCarts[0].items.some(i => i.productId === 'prod_123');
        const inCart2 = finalCarts[1].items.some(i => i.productId === 'prod_123');
        
        if (inCart1 && inCart2) {
            console.log('PASS: Item correctly exists in multiple carts.');
        } else {
            console.error('FAIL: Item multi-cart persistence failed.');
            process.exit(1);
        }

        console.log('ALL STORAGE TESTS PASSED.');
        process.exit(0);
    } catch (e) {
        console.error('ERROR during tests:', e);
        process.exit(1);
    }
}

runTests();