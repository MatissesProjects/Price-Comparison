// Content script
console.log('Price Comparison Tool: Content script loaded.');

function extractMenu() {
    console.log('Attempting extraction...');
    let products = [];

    // Strategy 1: Next.js Data Blob
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
        try {
            const jsonData = JSON.parse(nextData.textContent);
            // Traverse JSON to find products (simplified path based on mock)
            const props = jsonData?.props?.pageProps?.initialState?.menu?.products;
            if (Array.isArray(props)) {
                products = props.map(p => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    category: p.category,
                    brand: p.brand
                }));
                console.log('Extracted via __NEXT_DATA__:', products);
                return products;
            }
        } catch (e) {
            console.error('Error parsing __NEXT_DATA__:', e);
        }
    }

    // Strategy 2: DOM Scraping (Fallback)
    const cards = document.querySelectorAll('.product-card');
    if (cards.length > 0) {
        cards.forEach(card => {
            const name = card.querySelector('.product-title')?.textContent;
            const priceStr = card.querySelector('.product-price')?.textContent;
            const category = card.querySelector('.product-category')?.textContent;
            const id = card.getAttribute('data-id');

            if (name && priceStr) {
                products.push({
                    id: id || `generated_${Math.random()}`,
                    name: name,
                    price: parseFloat(priceStr.replace('$', '')),
                    category: category || 'Unknown',
                    brand: 'Unknown'
                });
            }
        });
        console.log('Extracted via DOM scraping:', products);
    }

    return products;
}

// Run extraction on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractMenu);
} else {
    extractMenu();
}