# Implementation Plan - Cart Management and Price Engine

## Phase 1: Data Structure & Vape Detection
- [x] Task: Refine Vape Detection Logic. 97b4634
    - [x] Update `src/content.js` to check for keywords (cartridge, pod, disposable, vape) and assign a normalized `type`.
    - [x] Update `tests/node_test.js` to verify vape detection.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Data Structure & Vape Detection' (Protocol in workflow.md). [checkpoint: b2f72af]
- [x] Task: Implement Cart Data Store. b5bf334
    - [x] Create `src/utils/storage.js` (or similar) to abstract `chrome.storage.local` operations for Carts and Products.
    - [x] Define helper functions: `createCart(name)`, `addToCart(cartId, productId)`, `getCart(id)`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Data Structure & Vape Detection' (Protocol in workflow.md).

## Phase 2: Cart UI & Interaction
- [x] Task: Build Cart Management UI. ece5da8
    - [x] Add a "Carts" tab to `src/popup/popup.html`.
    - [x] Implement "Create Cart" form.
    - [x] Display list of active carts.
- [x] Task: Add to Cart Functionality. 230fa3f
    - [x] In the "Menu Data" view, add an "Add to Cart" button next to each item.
    - [x] specific modal or dropdown to select which cart(s) to add to.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Cart UI & Interaction' (Protocol in workflow.md).

## Phase 3: Price Engine & Comparison
- [ ] Task: Implement Price Calculation Logic.
    - [ ] Create `src/utils/pricing.js`.
    - [ ] Function `calculateCartTotal(cart, products)`:
        -   Iterate items.
        -   Parse `promo_code` (e.g., "30OFF" -> 0.30 multiplier).
        -   Return `{ subtotal, discount, total }`.
- [ ] Task: Update Cart UI with Totals.
    - [ ] Display calculated totals for each cart card.
    -   Highlight the cheapest cart (e.g., green border or "Best Value" badge).
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Price Engine & Comparison' (Protocol in workflow.md).
