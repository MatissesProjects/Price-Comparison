// Content script
console.log('Price Comparison Tool: Content script loaded.');

function extractMenu() {
    console.log('Attempting extraction at:', window.location.href);
    let products = [];

    const vapeKeywords = ['vape', 'cartridge', 'pod', 'disposable', '510', 'battery'];
    const vapeBrands = ['surplus', 'allswell', 'punch edibles'];
    
    function detectType(name, category, brand, thc) {
        const fullText = `${name} ${category}`.toLowerCase();
        const brandLower = brand.toLowerCase();
        
        // Brand-specific rules
        if (vapeBrands.includes(brandLower)) {
            return 'vape';
        }

        if (brandLower === 'circles') {
            // Parse THC percentage (e.g., "85% THC" -> 85)
            const thcMatch = thc ? thc.match(/(\d+(\.\d+)?)%/) : null;
            if (thcMatch) {
                const percentage = parseFloat(thcMatch[1]);
                if (percentage > 60) {
                    return 'vape';
                }
            }
        }

        // Keyword fallback
        if (vapeKeywords.some(keyword => fullText.includes(keyword))) {
            return 'vape';
        }
        return 'other';
    }

    // DOM Scraping Logic
    console.log('Scraping DOM for product cards...');
    
    // Eaze specific selectors based on live data
    const cards = document.querySelectorAll('.esxr620, [data-e2eid="product-image-container"]');
    
    if (cards.length > 0) {
        console.log(`Found ${cards.length} potential product containers.`);
        cards.forEach(cardContainer => {
            // Navigate up to a common parent if we found the image container
            const card = cardContainer.hasAttribute('data-e2eid') ? cardContainer.closest('.e1mku4dk0') || cardContainer.parentElement.parentElement : cardContainer;
            
            const nameEl = card.querySelector('[data-e2eid="productCardName"]');
            const brandEl = card.querySelector('.e1mku4dk9');
            const priceEl = card.querySelector('button[aria-label="Add to bag"] span span, .e1qfw1ka4 span');
            const linkEl = card.querySelector('a[href*="/products/"]');
            const promoEl = card.querySelector('div[data-e2eid="tag"] span');
            
            // Text-based THC extraction
            let thc = null;
            const potentialThcElements = card.querySelectorAll('p, div, span');
            for (const el of potentialThcElements) {
                if (el.textContent.includes('% THC')) {
                    thc = el.textContent.trim();
                    break;
                }
            }

            if (nameEl && priceEl) {
                const priceText = priceEl.textContent.trim().replace('$', '');
                const productId = linkEl?.getAttribute('href')?.split('/cid/')?.[1] || `scraped_${Math.random().toString(36).substr(2, 9)}`;
                const name = nameEl.textContent.trim();
                const category = card.querySelector('.e1dcvvwe0')?.textContent?.trim() || 'Unknown';
                const brand = brandEl?.textContent?.trim() || 'Unknown';
                
                products.push({
                    id: productId,
                    name: name,
                    price: parseFloat(priceText),
                    category: category,
                    brand: brand,
                    promo_code: promoEl ? promoEl.textContent.trim() : null,
                    type: detectType(name, category, brand, thc)
                });
            }
        });
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

// Observe for dynamic changes
let timeout;
const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(extractMenu, 2000);
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
