# Track Specification: Core Extension Infrastructure and Menu Ingestion

## Objective
Establish the foundational structure of the Chrome Extension using Manifest V3 and Vanilla JavaScript/Tailwind CSS. Implement the core "silent observer" functionality to ingest menu data from Eaze.com page responses or DOM and persist it to local storage.

## Core Requirements
1.  **Manifest V3 Configuration:**
    -   Permissions: `storage`, `activeTab` (or host permissions for `*://*.eaze.com/*`).
    -   Action: Browser action with a popup.
    -   Content Scripts: Logic to run on Eaze.com pages.
2.  **Popup UI (Skeleton):**
    -   Basic HTML structure styled with Tailwind CSS.
    -   Display status (e.g., "Ready", "Menu Captured").
    -   Debug view to show raw JSON of captured menu items.
3.  **Menu Ingestion (Content Script):**
    -   **Strategy:** "Silent Observer".
    -   **Mechanism:** Inspect the DOM for specific data attributes or `__NEXT_DATA__` JSON blobs typically found in React/Next.js sites (which Eaze likely uses). Fallback to scraping key DOM elements (Product Name, Price, Category).
    -   **Trigger:** Auto-run on page load or URL change within Eaze.com/menu.
4.  **Data Persistence:**
    -   Save ingested data to `chrome.storage.local`.
    -   Structure: `menu: { timestamp: <date>, items: [...] }`.

## Success Criteria
- [ ] Extension loads in Chrome Developer Mode without errors.
- [ ] Clicking the extension icon opens the styled popup.
- [ ] Navigating to a mock/real Eaze.com menu page logs the extraction success to the console.
- [ ] Extracted menu data is visible in `chrome.storage.local` (verified via Popup debug view).
