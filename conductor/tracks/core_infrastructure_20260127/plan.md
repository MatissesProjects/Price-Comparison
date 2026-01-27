# Implementation Plan - Core Extension Infrastructure and Menu Ingestion

## Phase 1: Project Skeleton & Manifest
- [ ] Task: Initialize project structure and `manifest.json` (V3).
    - [ ] Create `manifest.json` with `name`, `version`, `manifest_version: 3`, and permissions (`storage`, `host_permissions` for eaze.com).
    - [ ] Create `src/background.js` (empty for now) and `src/content.js`.
    - [ ] Create `src/popup/popup.html` and `src/popup/popup.js`.
- [ ] Task: Set up Tailwind CSS.
    - [ ] Initialize npm: `npm init -y`.
    - [ ] Install Tailwind CLI: `npm install -D tailwindcss`.
    - [ ] Configure `tailwind.config.js` to scan `src/**/*.{html,js}`.
    - [ ] Create `src/styles.css` with Tailwind directives.
    - [ ] Add build script to `package.json` to output to `dist/output.css`.
- [ ] Task: Create basic Popup UI.
    - [ ] Build a simple HTML layout in `src/popup/popup.html` linking to `dist/output.css`.
    - [ ] Add a "Status" indicator (Default: "Idle") and a "Debug Data" text area.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Project Skeleton & Manifest' (Protocol in workflow.md).

## Phase 2: Data Ingestion Logic
- [ ] Task: Analyze Eaze.com structure (Research).
    - [ ] *Note: Since we cannot browse live, we will assume a standard React/Next.js structure or generic DOM classes first, then refine.*
    - [ ] Create a local mock HTML file (`tests/mock_eaze_menu.html`) simulating the Eaze menu structure (using `__NEXT_DATA__` script tag pattern or standard product cards).
- [ ] Task: Implement Content Script for Data Extraction.
    - [ ] Write logic in `src/content.js` to look for `script[id="__NEXT_DATA__"]` or specific DOM elements.
    - [ ] Parse the found data into a clean format: `{ name, price, category, id }`.
    - [ ] Add console logs to confirm extraction works on the mock page.
- [ ] Task: Implement Message Passing.
    - [ ] Update `src/content.js` to send extracted data to `chrome.storage.local` directly (or via background if needed, but direct save is allowed in V3 content scripts for `storage.local`).
    - [ ] Save under key `latest_menu`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Data Ingestion Logic' (Protocol in workflow.md).

## Phase 3: Storage & Verification
- [ ] Task: Connect Popup to Storage.
    - [ ] Update `src/popup/popup.js` to read `latest_menu` from `chrome.storage.local` on load.
    - [ ] Display the item count and raw JSON in the "Debug Data" text area.
    - [ ] Add a "Refresh" button to re-read storage.
- [ ] Task: Final Integration Verification.
    - [ ] Verify the full flow: Load Mock Page -> Content Script Runs -> Saves to Storage -> Popup Displays Data.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Storage & Verification' (Protocol in workflow.md).
