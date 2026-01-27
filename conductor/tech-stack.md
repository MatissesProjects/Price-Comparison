# Tech Stack

## Core Technologies
- **Logic:** Vanilla JavaScript (ES6+)
- **Styling:** Tailwind CSS (via CLI build step)
- **Platform:** Chrome Extension Manifest V3

## Build & Tooling
- **Package Manager:** npm (for managing Tailwind and potential future dependencies)
- **CSS Processor:** Tailwind CLI to compile utility classes into a standard CSS file.

## Architecture
- **State Management:** Simple JavaScript objects persisted via `chrome.storage.local`.
- **Communication:** Standard Message Passing between content scripts (for menu ingestion) and the popup/background scripts.
