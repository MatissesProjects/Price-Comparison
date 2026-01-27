# Initial Concept
Goal of this project is to do a price comparison between different items that could be in a cart
We will use the page https://www.eaze.com/menu to base the menu items off of
We want to be able to apply discounts to only specific items

# Product Definition

## Vision
A personal Chrome Extension designed to optimize purchasing decisions on Eaze.com. It allows the user to compare their "standard order" against alternative scenarios by accurately calculating the final price—inclusive of complex, item-specific discounts and varied tax rates—which are often opaque during standard browsing.

## Target Audience
- **Primary User:** The Developer (Personal Use).
- **Goal:** To save money and maximize value by mathematically proving which cart configuration offers the best deal after all adjustments.

## Core Features
1.  **Automated Menu Ingestion:**
    -   Automatically extract structured menu data (products, prices, categories) from the Eaze.com page response/network traffic when the user visits the site.
2.  **Scenario Builder:**
    -   Create and manage multiple "virtual carts" (e.g., "My Usual", "Sale Strategy A", "Bulk Buy").
    -   Manually select items from the ingested menu to populate these carts.
3.  **Advanced Pricing Engine:**
    -   Apply granular discounts to specific items or categories (e.g., "$10 off Edibles", "20% off First Order").
    -   Calculate complex tax rules that may differ by item type.
4.  **Comparison Dashboard:**
    -   Side-by-side view of different cart scenarios showing the breakdown of subtotal, discounts, taxes, and final "out-the-door" price.
5.  **Smart Suggestions:**
    -   Suggest optimal cart combinations or items to maximize value based on available discounts and user preferences.

## Platform
- **Type:** Google Chrome Extension.
