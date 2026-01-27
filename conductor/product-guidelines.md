# Product Guidelines

## Visual Identity
- **Aesthetic:** Utilitarian & Raw.
- **Principles:**
    - Function over form. Use standard browser UI elements and default HTML styling to minimize design overhead.
    - Prioritize clarity and data visibility. Information should be presented in simple tables or lists.

## User Experience (UX)
- **Interaction Model:** "Silent Observer". The extension should not interrupt the user's browsing experience on Eaze. All interactions, scenario building, and comparisons happen within the extension's popup or a dedicated options page.
- **Navigation:** Simple, flat hierarchy. Quick access to "Current Menu Data", "Saved Scenarios", and "Price Engine Rules".

## Technical Constraints
- **Data Persistence:** Local browser storage (`chrome.storage.local`) only. No external database or cloud syncing required.
- **Privacy:** All data remains on the user's machine.

## Data Handling
- **Menu Snapshots:** Store the last successfully ingested menu data for offline scenario building.
- **Export/Import (Optional Future):** While currently local-only, the data structure should be clean enough to allow for a JSON export feature if needed later.
