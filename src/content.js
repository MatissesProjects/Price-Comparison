// Content script
console.log('Price Comparison Tool: Content script loaded.');

function extractMenu() {
    console.log('Attempting extraction at:', window.location.href);
    let products = [];

    // Strategy 1: Next.js Data Blob
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
        console.log('Found __NEXT_DATA__ script tag.');
        try {
            const jsonData = JSON.parse(nextData.textContent);
            
            // Recursive search for products
            function findProductArrays(obj) {
                if (!obj || typeof obj !== 'object') return [];
                
                if (Array.isArray(obj)) {
                    // Check if this array contains objects that look like products
                    const isProductArray = obj.length > 0 && obj.every(item => 
                        item && typeof item === 'object' && 
                        (item.name || item.title) && 
                        (item.price !== undefined || item.price_cents !== undefined)
                    );
                    
                    if (isProductArray) return [obj];
                    
                    return obj.flatMap(findProductArrays);
                }
                
                return Object.values(obj).flatMap(findProductArrays);
            }

            const potentialArrays = findProductArrays(jsonData);
            if (potentialArrays.length > 0) {
                // Take the largest array found
                const bestArray = potentialArrays.reduce((a, b) => a.length > b.length ? a : b);
                console.log(`Found ${bestArray.length} products in JSON.`);
                
                products = bestArray.map(p => ({
                    id: p.id || p._id || p.sku || `gen_${Math.random().toString(36).substr(2, 9)}`,
                    name: p.name || p.title,
                    price: p.price || (p.price_cents ? p.price_cents / 100 : 0),
                    category: p.category || p.type || 'General',
                    brand: p.brand || p.brand_name || 'Unknown'
                }));
            }
        } catch (e) {
            console.error('Error parsing __NEXT_DATA__:', e);
        }
    }

    // Strategy 2: DOM Scraping (Fallback)
    if (products.length === 0) {
        console.log('No products found in JSON, trying DOM scraping...');
        
        // Try specific Eaze-like selectors (if we knew them) or generic ones
        const selectors = ['.product-card', '[data-testid="product-card"]', '.ProductCard'];
        let cards = [];
        for (const selector of selectors) {
            cards = document.querySelectorAll(selector);
            if (cards.length > 0) {
                console.log(`Found cards using selector: ${selector}`);
                break;
            }
        }

        if (cards.length > 0) {
            cards.forEach(card => {
                const name = card.querySelector('h1, h2, h3, .name, .title')?.textContent?.trim();
                const priceText = card.innerText.match(/\$\d+(\.\d{2})?/)?.[0];
                
                if (name && priceText) {
                    products.push({
                        id: card.id || card.getAttribute('data-id') || `scraped_${Math.random().toString(36).substr(2, 9)}`,
                        name: name,
                        price: parseFloat(priceText.replace('$', '')),
                        category: 'Unknown',
                        brand: 'Unknown'
                    });
                }
            });
        }
    }

    if (products.length > 0) {
        console.log(`Successfully extracted ${products.length} products.`);
        saveMenuData(products);
    } else {
        console.warn('Extraction failed: No products identified.');
    }
}

function saveMenuData(products) {
    const data = {
        timestamp: new Date().toISOString(),
        items: products
    };
    chrome.storage.local.set({ latest_menu: data }, () => {
        if (chrome.runtime.lastError) {
            console.error('Save failed:', chrome.runtime.lastError);
        } else {
            console.log('Data saved successfully.');
        }
    });
}

// Observe for dynamic changes (Eaze might load data after initial load)
let timeout;
const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(extractMenu, 2000); // Wait 2s after last change
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial run
extractMenu();
