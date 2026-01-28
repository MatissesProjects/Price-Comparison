# Category Filtering and Metadata Enhancement Spec

## Goal
Enhance the item categorization logic to support more product types (specifically "edibles", "flower", "preroll", "concentrate") and provide a UI in the popup to filter the menu by these categories.

## Requirements

### Data Extraction (`src/content.js`)
- Update `detectType` function.
- Add detection for:
  - **Edibles**: keywords [gummy, gummi, chocolate, cookie, brownie, mint, lozenge, syrup, drink, beverage]
  - **Flower**: keywords [flower, bud, gram, eighth, ounce]
  - **Preroll**: keywords [preroll, pre-roll, joint, blunt]
  - **Concentrate**: keywords [wax, shatter, resin, rosin, sauce, badder, budder, crumble, diamond]
- Ensure 'vape' detection remains robust.
- Default to 'other' if no match found.

### User Interface (`src/popup/popup.html`)
- Add a "Filter Bar" above the search input in the Menu tab.
- Buttons/Chips for:
  - All (Default)
  - Vape
  - Edible
  - Flower
  - Preroll
  - Extract (Concentrate)

### Logic (`src/popup/popup.js`)
- State management for `activeCategory` (default: 'all').
- Update `filterAndRenderMenu`:
  - If `activeCategory` is 'all', proceed as before.
  - If `activeCategory` is set, filter items where `item.type === activeCategory`.
  - Combine with search query (AND logic).
- styling for active filter button.
