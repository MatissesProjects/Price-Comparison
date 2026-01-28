# Track Specification: Cart Management and Price Engine

## Objective
Implement the core business logic for managing multiple "virtual carts," adding items to them, and calculating the final price including item-specific discounts. The goal is to allow users to compare different cart configurations to find the cheapest option.

## Core Requirements
1.  **Cart Management:**
    -   Create, Read, Update, Delete (CRUD) named carts (e.g., "Stiiizy Haul", "Edibles Only").
    -   Items can exist in multiple carts simultaneously (many-to-many relationship logic).
    
2.  **Item categorization (Vape Detection):**
    -   Refine ingestion logic to better classify items, specifically identifying "Vapes" (Cartridges, Pods, Disposables) based on keywords in the name or category.

3.  **Price Engine:**
    -   **Base Calculation:** Sum of item prices.
    -   **Discount Logic:** Apply the extracted `promo_code` (e.g., "30% OFF") to the specific item's price within the cart context.
    -   **Totals:** Calculate `Subtotal`, `Discount Amount`, and `Final Total` for each cart.

4.  **Comparison UI:**
    -   Display multiple carts side-by-side or in a list.
    -   Highlight the cart with the lowest `Final Total`.

## Data Structure
-   `carts`: Array of objects `{ id, name, items: [ { productId, quantity } ] }`
-   `products`: (Existing) The master list of ingested items.

## Success Criteria
- [ ] User can create multiple named carts.
- [ ] User can add an ingested item to one or more carts.
- [ ] If an item has a promo code, the cart total reflects the discounted price.
- [ ] "Vape" items are correctly tagged in the UI.
- [ ] The UI clearly indicates which cart is the cheapest.
