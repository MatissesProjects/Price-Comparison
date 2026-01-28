// Content script
console.log('Price Comparison Tool: Content script loaded.');

function extractMenu() {
    console.log('Attempting extraction...');
    let products = [];

    // Debug: Log all script tags to find hidden data
    const scripts = document.querySelectorAll('script');
    console.log(`Found ${scripts.length} script tags.`);
    scripts.forEach((s, i) => {
        if (s.textContent.includes('"price"') || s.textContent.includes('"name"')) {
            console.log(`Potential Data in Script #${i} (id: ${s.id}):`, s.textContent.substring(0, 200) + '...');
        }
    });

    // Strategy 1: Next.js Data Blob (Expanded)
    const nextData = document.getElementById('__NEXT_DATA__');
    if (nextData) {
        try {
            const jsonData = JSON.parse(nextData.textContent);
            console.log('Found __NEXT_DATA__:', jsonData);
            // Try to find an array that looks like products
            // This is a recursive search for any array containing objects with 'price' and 'name'
            const findProducts = (obj) => {
                if (!obj || typeof obj !== 'object') return [];
                if (Array.isArray(obj)) {
                    const sample = obj[0];
                    if (sample && typeof sample === 'object' && 'name' in sample && ('price' in sample || 'price_cents' in sample)) {
                        return obj;
                    }
                    return obj.flatMap(findProducts);
                }
                return Object.values(obj).flatMap(findProducts);
            };
            
            const found = findProducts(jsonData);
            if (found.length > 0) {
                console.log('Deep search found potential products in JSON:', found);
                products = found.map(p => ({
                    id: p.id || p._id || `gen_${Math.random()}`,
                    name: p.name || p.title,
                    price: p.price || (p.price_cents ? p.price_cents / 100 : 0),
                    category: p.category || p.type || 'Unknown',
                    brand: p.brand || p.brand_name || 'Unknown'
                }));
            }
        } catch (e) {
            console.error('Error parsing __NEXT_DATA__:', e);
        }
    }

    // Strategy 2: DOM Scraping (Fallback - Expanded)
    if (products.length === 0) {
        console.log('Trying generic DOM scraping...');
        // Try to find elements that look like prices
        const priceElements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.children.length === 0 && /^\$\d+(\.\d{2})?$/.test(el.textContent.trim())
        );
        
        console.log(`Found ${priceElements.length} price-like elements.`);
        
        priceElements.forEach(priceEl => {
            // Traverse up to find a container
            let container = priceEl.parentElement;
            let attempts = 0;
            while (container && attempts < 3) {
                const text = container.innerText;
                if (text.length > 10 && text.length < 500) {
                    // This container likely holds the product info
                    products.push({
                         id: `scraped_${Math.random()}`,
                         name: 'Unknown (Scraped)', // Placeholder, implies we need better selectors
                         price: parseFloat(priceEl.textContent.replace('$', '')),
                         raw_text: text.substring(0, 50)
                    });
                    break;
                }
                container = container.parentElement;
                attempts++;
            }
        });
    }

    if (products.length > 0) {
        saveMenuData(products);
    } else {
        console.warn('No products found on page.');
    }

    return products;
}

function saveMenuData(products) {
    const data = {
        timestamp: new Date().toISOString(),
        items: products
    };
    chrome.storage.local.set({ latest_menu: data }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error saving menu data:', chrome.runtime.lastError);
        } else {
            console.log('Menu data saved to storage:', data);
        }
    });
}

// Run extraction on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', extractMenu);
} else {
    extractMenu();
}