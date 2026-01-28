# Implementation Plan - Core Extension Infrastructure and Menu Ingestion

## Phase 1: Project Skeleton & Manifest
- [x] Task: Initialize project structure and `manifest.json` (V3). ab9eeec
    - [x] Create `manifest.json` with `name`, `version`, `manifest_version: 3`, and permissions (`storage`, `host_permissions` for eaze.com).
    - [x] Create `src/background.js` (empty for now) and `src/content.js`.
    - [x] Create `src/popup/popup.html` and `src/popup/popup.js`.
- [x] Task: Set up Raw CSS. ba36352
    - [x] Create `src/styles.css` with basic utility classes and reset.
    - [x] Link `styles.css` in `src/popup/popup.html`.
- [x] Task: Create basic Popup UI. 3776776
    - [x] Build a simple HTML layout in `src/popup/popup.html` linking to `../styles.css`.
    - [x] Add a "Status" indicator (Default: "Idle") and a "Debug Data" text area.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Project Skeleton & Manifest' (Protocol in workflow.md). [checkpoint: 9773951]

## Phase 2: Data Ingestion Logic
- [x] Task: Analyze Eaze.com structure (Research). 24ae437
    - [x] *Note: Since we cannot browse live, we will assume a standard React/Next.js structure or generic DOM classes first, then refine.*
    - [x] Create a local mock HTML file (`tests/mock_eaze_menu.html`) simulating the Eaze menu structure (using `__NEXT_DATA__` script tag pattern or standard product cards).
- [x] Task: Implement Content Script for Data Extraction. bd428cf
    - [x] Write logic in `src/content.js` to look for `script[id="__NEXT_DATA__"]` or specific DOM elements.
    - [x] Parse the found data into a clean format: `{ name, price, category, id }`.
    - [x] Add console logs to confirm extraction works on the mock page.
- [x] Task: Implement Message Passing. 0a2f37d
    - [x] Update `src/content.js` to send extracted data to `chrome.storage.local` directly (or via background if needed, but direct save is allowed in V3 content scripts for `storage.local`).
    - [x] Save under key `latest_menu`.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Data Ingestion Logic' (Protocol in workflow.md). [checkpoint: 5e9a309]

## Phase 3: Storage & Verification
- [x] Task: Connect Popup to Storage. 6484cc1
    - [x] Update `src/popup/popup.js` to read `latest_menu` from `chrome.storage.local` on load.
    - [x] Display the item count and raw JSON in the "Debug Data" text area.
    - [x] Add a "Refresh" button to re-read storage.
- [x] Task: Final Integration Verification. 5621421
    - [x] Verify the full flow: Load Mock Page -> Content Script Runs -> Saves to Storage -> Popup Displays Data.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Storage & Verification' (Protocol in workflow.md).
