# Tech Stack

## Core Technologies
- **Logic:** Vanilla JavaScript (ES6+)
- **Styling:** Raw CSS (No build step, standard CSS3+)
- **Platform:** Chrome Extension Manifest V3

## Build & Tooling
- **Package Manager:** npm (optional, for future dependencies)
- **CSS Processor:** None (Native CSS)

## Architecture
- **State Management:** Simple JavaScript objects persisted via `chrome.storage.local`.
- **Communication:** Standard Message Passing between content scripts and the popup/background scripts (e.g., REFRESH_DATA trigger).
- **Extraction Strategy:** Targeted DOM scraping using specific e2e-id and structural selectors for reliable data capture (with promo code support).
