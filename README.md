# Eaze Price Comparison Tool

A Chrome Extension designed to help users find the best value on Eaze.com by comparing multiple potential shopping carts with real-time pricing, discounts, and tax calculations.

## Features

- **Menu Data Capture**: Automatically scrapes product data (names, prices, brands, and promos) directly from the Eaze menu.
- **Vape Detection**: Intelligent detection logic to identify vape products based on keywords, brands, and THC content.
- **Multiple Cart Management**:
  - Create and manage multiple comparison lists.
  - Rename carts in-place for easy organization (e.g., "Budget List" vs "High Potency").
  - Add items from the captured menu to one or more carts.
- **Real-time Search**: Quick filtering of captured menu items by name, brand, or category.
- **Advanced Pricing Engine**:
  - **Promo Parsing**: Automatically handles discounts like "30% OFF" or "$10 OFF".
  - **Dynamic Totals**: Calculates subtotals and discounts as you adjust quantities.
  - **Tax Calculation**: Applies a realistic 43.75% tax and fee rate to provide an accurate "Estimated Total".
  - **Best Value Highlighting**: Automatically identifies and highlights the cheapest cart list to help you save money.

## How to Use

1. **Capture Data**: Visit [Eaze.com/menu](https://www.eaze.com/menu). The extension will automatically capture the products visible on the page.
2. **Create Carts**: Open the extension popup, go to the **Carts** tab, and create your comparison lists.
3. **Build Your Lists**: Switch to the **Menu Data** tab. Use the search bar to find products and click **Add** to place them in your desired carts.
4. **Compare**: Return to the **Carts** tab to see the itemized breakdown, tax estimates, and the "Best Value" winner.
5. **Adjust**: Increase/decrease quantities or remove items directly within the cart view to see how it affects the total.

## Technical Details

- **Built with**: JavaScript (ES6+), HTML5, CSS3.
- **Storage**: Uses `chrome.storage.local` for persistent data.
- **Testing**: Includes a suite of Node.js tests for the pricing engine and data extraction logic.