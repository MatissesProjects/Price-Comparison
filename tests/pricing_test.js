const Pricing = require('../src/utils/pricing.js');
const assert = require('assert');

console.log('Running Pricing Engine Tests...');

// 1. Test parsePromo
console.log('Testing parsePromo...');
const testPromos = [
    { input: '30% OFF', expected: { type: 'percent', value: 0.3 } },
    { input: '$10 OFF', expected: { type: 'flat', value: 10 } },
    { input: '20OFF', expected: { type: 'percent', value: 0.2 } },
    { input: 'BOGO', expected: { type: 'flat', value: 0 } },
    { input: null, expected: { type: 'flat', value: 0 } }
];

testPromos.forEach(({ input, expected }) => {
    const result = Pricing.parsePromo(input);
    assert.deepStrictEqual(result, expected, `Failed for input: ${input}`);
});
console.log('PASS: parsePromo');

// 2. Test calculateCartTotal
console.log('Testing calculateCartTotal...');
const products = [
    { id: 'p1', name: 'Product 1', price: 100, promo_code: '20% OFF' },
    { id: 'p2', name: 'Product 2', price: 50, promo_code: '$10 OFF' },
    { id: 'p3', name: 'Product 3', price: 30, promo_code: null }
];

const cart = {
    items: [
        { productId: 'p1', quantity: 1 }, // 100 - 20 = 80
        { productId: 'p2', quantity: 2 }, // (50 - 10) * 2 = 80
        { productId: 'p3', quantity: 1 }  // 30 - 0 = 30
    ]
};

// Expected:
// Subtotal: 100 + 100 + 30 = 230
// Discount: 20 + 20 + 0 = 40
// Subtotal After Discount: 190
// Tax (43.75% of 190): 83.13 (rounded)
// Total: 190 + 83.13 = 273.13

const totals = Pricing.calculateCartTotal(cart, products);
console.log('Calculated totals:', totals);

assert.strictEqual(totals.subtotal, 230);
assert.strictEqual(totals.discount, 40);
assert.strictEqual(totals.tax, 83.13);
assert.strictEqual(totals.total, 273.13);
assert.strictEqual(totals.itemCount, 4);

console.log('PASS: calculateCartTotal');

console.log('All pricing tests passed!');
