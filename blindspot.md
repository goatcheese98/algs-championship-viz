# Project Blindspots & Future Improvements

This document outlines potential blindspots in the current implementation and suggests areas for future improvement. Acknowledging these points is crucial for the long-term health and scalability of the project.

## 1. Lack of Automated Testing

**Observation:** The codebase currently lacks a testing framework (e.g., Vitest, Jest) and has no unit, integration, or end-to-end tests.

**Potential Issues:**
- **Regressions:** Without tests, new features or refactoring can easily introduce bugs in existing functionality.
- **Maintenance Difficulty:** It's harder for new developers to contribute confidently without a test suite to validate their changes.
- **Reduced Reliability:** The overall reliability of the application is lower without automated verification.

**Recommendation:**
- Integrate a testing framework like **Vitest** into the Vite project.
- Start by adding unit tests for critical business logic, such as the data processing functions in `src/stores/tournament.js` and the map coloring logic in `src/chart/MapColoringLogic.js`.
- Gradually add component tests for key components like `TournamentView.vue` and `InteractiveRaceChart.vue`.

## 2. Client-Side Data Processing Scalability

**Observation:** All CSV data is fetched and processed in the browser. This includes parsing, transforming from long to wide format, and pre-computing scores.

**Potential Issues:**
- **Performance Bottlenecks:** As the number of tournaments and the size of the data files grow, client-side processing can become slow, leading to a poor user experience (longer loading times).
- **Increased Memory Usage:** Large datasets can consume significant memory in the user's browser.

**Recommendation:**
- For future scalability, consider a **backend pre-processing step**. A simple script could run at build time or on a server to transform all raw CSVs into a consistent, pre-computed JSON format. The frontend would then only need to fetch the optimized JSON, reducing client-side load.

## 3. Robustness of Error Handling

**Observation:** The Pinia store has an `errorMessage` state, but the UI's presentation of errors could be more comprehensive.

**Potential Issues:**
- **User Confusion:** If data fails to load, the user might see a broken or empty chart without a clear explanation of what went wrong.
- **Debugging Difficulty:** Generic error messages can make it hard to diagnose the root cause of a problem.

**Recommendation:**
- Implement more specific error messages for different failure scenarios (e.g., network error, file not found, data parsing error).
- Create a dedicated error component in the UI to display these messages in a user-friendly way, potentially with suggestions for how to resolve the issue (e.g., "Check your internet connection" or "Try selecting a different matchup").

## 4. Component Communication and Reusability

**Observation:** Components like `TournamentView.vue` interact with child components through a mix of props and direct access to the Pinia store.

**Potential Issues:**
- **Tight Coupling:** Components can become tightly coupled to the store's structure, making them harder to reuse in different contexts.
- **Unclear Data Flow:** It can be difficult to trace the flow of data and events when components implicitly rely on the store.

**Recommendation:**
- Strive for a clearer contract between parent and child components. Use **props for passing data down** and **events for communicating up**. The child component shouldn't always need to know about the existence of the Pinia store.

## 5. Code Duplication

**Observation:** There is some evidence of duplicated code, such as the `exportData` logic appearing in both `TournamentView.vue` and `ActionPanel.vue`.

**Potential Issues:**
- **Maintenance Overhead:** When a piece of logic needs to be updated, it has to be changed in multiple places, which is error-prone.

**Recommendation:**
- Centralize duplicated logic into **composables** or utility functions. For example, the CSV export logic could be extracted into a `useCsvExport.js` composable.

## 6. Accessibility (a11y)

**Observation:** The application has some basic accessibility features like `title` attributes, but it has not undergone a thorough accessibility audit.

**Potential Issues:**
- **Exclusion of Users:** Users with disabilities who rely on screen readers or keyboard navigation may find it difficult or impossible to use the application.

**Recommendation:**
- Conduct a full accessibility review, focusing on:
  - **Keyboard Navigation:** Ensure all interactive elements are focusable and operable with the keyboard.
  - **ARIA Attributes:** Add appropriate ARIA roles and attributes to provide context for screen readers, especially for the interactive chart.
  - **Color Contrast:** Verify that text and UI elements meet minimum color contrast ratios.

## 7. Lack of a Backend and Potential Security Concerns

**Observation:** This is a frontend-only application. While this simplifies deployment, it has limitations.

**Potential Issues:**
- **Data Management:** All data is managed through CSV files in the `public` directory, which is not ideal for a growing dataset.
- **Security:** If the application were to evolve to include user accounts or data submission, the lack of a backend would introduce significant security risks.

**Recommendation:**
- For future versions that require more complex data management or user-specific features, plan for the development of a **backend API**. This would provide a more secure and scalable way to handle data.
