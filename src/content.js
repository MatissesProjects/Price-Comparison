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
        
        // Eaze specific selectors based on live data
        const cards = document.querySelectorAll('.esxr620, [data-e2eid="product-image-container"]');
        
        if (cards.length > 0) {
            console.log(`Found ${cards.length} potential product containers.`);
            cards.forEach(cardContainer => {
                // Navigate up to a common parent if we found the image container
                const card = cardContainer.hasAttribute('data-e2eid') ? cardContainer.closest('.e1mku4dk0') || cardContainer.parentElement.parentElement : cardContainer;
                
                const nameEl = card.querySelector('[data-e2eid="productCardName"]');
                const brandEl = card.querySelector('.e1mku4dk9'); // Brand is often after the name
                const priceEl = card.querySelector('button[aria-label="Add to bag"] span span, .e1qfw1ka4 span');
                const linkEl = card.querySelector('a[href*="/products/"]');
                const promoEl = card.querySelector('div[data-e2eid="tag"] span');

                if (nameEl && priceEl) {
                    const priceText = priceEl.textContent.trim().replace('$', '');
                    const productId = linkEl?.getAttribute('href')?.split('/cid/')?.[1] || `scraped_${Math.random().toString(36).substr(2, 9)}`;
                    
                    products.push({
                        id: productId,
                        name: nameEl.textContent.trim(),
                        price: parseFloat(priceText),
                        category: card.querySelector('.e1dcvvwe0')?.textContent?.trim() || 'Unknown',
                        brand: brandEl?.textContent?.trim() || 'Unknown',
                        promo_code: promoEl ? promoEl.textContent.trim() : null
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

// Message Listener for popup communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'REFRESH_DATA') {
        console.log('Received refresh request from popup.');
        extractMenu();
        sendResponse({ status: 'started' });
    }
});

// Initial run
extractMenu();
