# Category Filtering Implementation Plan

- [ ] **Step 1: Update Content Script**
  - [ ] Refactor `detectType` in `src/content.js` to support multiple categories (Edible, Flower, Preroll, Concentrate).
  - [ ] Add unit tests or verify with dry-run/console logs if possible (or rely on user verification).

- [ ] **Step 2: Update Popup UI**
  - [ ] Modify `src/popup/popup.html` to include the filter bar container and buttons.
  - [ ] Add CSS in `src/styles.css` (or `popup.html` style block if inline) for the filter chips (scrolling horizontal list if needed, or simple flex wrap).

- [ ] **Step 3: Implement Filter Logic**
  - [ ] Update `src/popup/popup.js` to handle filter clicks.
  - [ ] Update `filterAndRenderMenu` to respect the selected category.

- [ ] **Step 4: Verify**
  - [ ] Load extension.
  - [ ] Trigger data refresh to get new categories.
  - [ ] Click filters and verify list updates.
