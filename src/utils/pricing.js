/**
 * Pricing Utility for Price Comparison Tool
 * Handles discount parsing and cart total calculations
 */

const Pricing = {
    /**
     * Parses a promo string into a discount value
     * @param {string} promo - e.g., "30% OFF", "$10 OFF", "20OFF"
     * @returns {Object} { type: 'percent'|'flat', value: number }
     */
    parsePromo: (promo) => {
        if (!promo) return { type: 'flat', value: 0 };

        const cleaned = promo.toUpperCase().replace(/\s/g, '');
        
        // Check for percentage (e.g., "30%OFF")
        const percentMatch = cleaned.match(/(\d+)%/);
        if (percentMatch) {
            return { type: 'percent', value: parseFloat(percentMatch[1]) / 100 };
        }

        // Check for flat discount (e.g., "$10OFF")
        const flatMatch = cleaned.match(/\$(\d+)/);
        if (flatMatch) {
            return { type: 'flat', value: parseFloat(flatMatch[1]) };
        }

        // Fallback for "20OFF" style
        const fallbackMatch = cleaned.match(/(\d+)OFF/);
        if (fallbackMatch) {
            return { type: 'percent', value: parseFloat(fallbackMatch[1]) / 100 };
        }

        return { type: 'flat', value: 0 };
    },

    /**
     * Calculates totals for a cart
     * @param {Object} cart - The cart object from storage
     * @param {Array} products - Array of product objects from latest_menu
     * @returns {Object} { subtotal, discount, total, itemCount }
     */
    calculateCartTotal: (cart, products) => {
        let subtotal = 0;
        let totalDiscount = 0;
        let itemCount = 0;

        const productMap = new Map(products.map(p => [p.id, p]));

        cart.items.forEach(item => {
            const product = productMap.get(item.productId);
            if (product) {
                const itemSubtotal = product.price * item.quantity;
                subtotal += itemSubtotal;
                itemCount += item.quantity;

                const promo = Pricing.parsePromo(product.promo_code);
                if (promo.type === 'percent') {
                    totalDiscount += itemSubtotal * promo.value;
                } else {
                    totalDiscount += promo.value * item.quantity;
                }
            }
        });

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: parseFloat(totalDiscount.toFixed(2)),
            total: parseFloat((subtotal - totalDiscount).toFixed(2)),
            itemCount: itemCount
        };
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pricing;
} else {
    window.PriceEngine = Pricing;
}
