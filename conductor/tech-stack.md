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
- **Communication:** Standard Message Passing between content scripts (for menu ingestion) and the popup/background scripts.
