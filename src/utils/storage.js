/**
 * Storage Utility for Price Comparison Tool
 * Handles persistence for Carts and Menu Data
 */

const Storage = {
    /**
     * Get all carts
     * @returns {Promise<Array>}
     */
    getCarts: () => {
        return new Promise((resolve) => {
            chrome.storage.local.get(['carts'], (result) => {
                resolve(result.carts || []);
            });
        });
    },

    /**
     * Create a new cart
     * @param {string} name 
     * @returns {Promise<Object>} The created cart
     */
    createCart: async (name) => {
        const carts = await Storage.getCarts();
        const newCart = {
            id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: name,
            items: []
        };
        carts.push(newCart);
        return new Promise((resolve) => {
            chrome.storage.local.set({ carts }, () => {
                resolve(newCart);
            });
        });
    },

    /**
     * Add a product to a cart
     * @param {string} cartId 
     * @param {string} productId 
     * @param {number} quantity 
     */
    addToCart: async (cartId, productId, quantity = 1) => {
        const carts = await Storage.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) throw new Error('Cart not found');

        const cart = carts[cartIndex];
        const itemIndex = cart.items.findIndex(i => i.productId === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        return new Promise((resolve) => {
            chrome.storage.local.set({ carts }, () => {
                resolve(cart);
            });
        });
    },

    /**
     * Decrement a product quantity in a cart
     * @param {string} cartId 
     * @param {string} productId 
     */
    decrementCartItem: async (cartId, productId) => {
        const carts = await Storage.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) throw new Error('Cart not found');

        const cart = carts[cartIndex];
        const itemIndex = cart.items.findIndex(i => i.productId === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity -= 1;
            if (cart.items[itemIndex].quantity <= 0) {
                cart.items.splice(itemIndex, 1);
            }
        }

        return new Promise((resolve) => {
            chrome.storage.local.set({ carts }, () => {
                resolve(cart);
            });
        });
    },

    /**
     * Remove an item from a cart
     * @param {string} cartId 
     * @param {string} productId 
     */
    removeFromCart: async (cartId, productId) => {
        const carts = await Storage.getCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) throw new Error('Cart not found');

        const cart = carts[cartIndex];
        cart.items = cart.items.filter(i => i.productId !== productId);

        return new Promise((resolve) => {
            chrome.storage.local.set({ carts }, () => {
                resolve(cart);
            });
        });
    },

    /**
     * Remove a cart
     * @param {string} cartId 
     */
    deleteCart: async (cartId) => {
        let carts = await Storage.getCarts();
        carts = carts.filter(c => c.id !== cartId);
        return new Promise((resolve) => {
            chrome.storage.local.set({ carts }, () => {
                resolve();
            });
        });
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
} else {
    window.PriceStorage = Storage;
}
