# Modern CSS Architecture: A Guideline for New Projects

This document provides a blueprint for establishing a high-performance, scalable, and maintainable CSS architecture for modern web applications. It is intended to be used as a starting point for new projects to ensure best practices are implemented from the outset.

## 1. Core Philosophy

*   **Performance First:** The primary goal is to optimize for the fastest possible user experience, focusing on metrics like First Contentful Paint (FCP) and Core Web Vitals.
*   **Utility-First:** Leverage a utility-first framework like Tailwind CSS to build designs directly in the markup. This promotes consistency, reduces CSS bundle size, and speeds up development.
*   **Modularity:** When custom CSS is necessary, it should be organized into small, reusable, and component-oriented modules.

## 2. Recommended Technology Stack

*   **Build Tool:** **Vite** (latest version). Its speed and out-of-the-box support for PostCSS and code-splitting make it an ideal choice.
*   **CSS Framework:** **Tailwind CSS** (latest version). Use its Just-In-Time (JIT) engine for maximum performance and a minimal production bundle.
*   **CSS Processing:** **PostCSS**. Vite includes this by default. We will use it for Tailwind integration, autoprefixing, and advanced production optimizations.

## 3. Recommended File Structure

Organize your styles in a dedicated `src/styles/` directory:

*   `src/styles/`
    *   `tailwind.css`: The entry point for Tailwind's directives (`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`).
    *   `main.css`: The main CSS entry point for the application. It should import `tailwind.css` and any other global styles.
    *   `design-tokens.css`: A dedicated file for all CSS Custom Properties (variables) that define the project's design system (colors, spacing, typography).
    *   `critical.css`: (Optional, for advanced optimization) Contains essential, above-the-fold styles for the initial page load.
    *   `non-critical.css`: (Optional, for advanced optimization) Contains deferred styles like animations, hover effects, and styles for components below the fold.
    *   `routes/`: A directory for route-specific CSS files, enabling code-splitting per page.
        *   `home.css`
        *   `profile.css`
        *   `settings.css`

## 4. The Critical CSS Strategy

For applications where initial load speed is paramount, split CSS into two categories:

*   **Critical CSS:**
    *   Contains the absolute minimum CSS required to render the visible part of the page correctly.
    *   This includes shell layout, header, and key UI elements.
    *   **Goal:** Keep this file under 20-30KB.
    *   **Implementation:** This file can be inlined in the `<head>` of your `index.html` or loaded as a high-priority stylesheet.

*   **Non-Critical CSS:**
    *   Contains all other styles that are not immediately needed.
    *   **Includes:** Animations, hover/focus states, complex gradients, and styles for components further down the page.
    *   **Implementation:** Load this file asynchronously using `<link rel="stylesheet" ... media="print" onload="this.media='all'">` or via JavaScript after the page has loaded.

## 5. Design Token System

A robust design system is key to consistency and maintainability.

1.  **Define Tokens:** Declare all colors, spacing units, font sizes, border radii, etc., as CSS Custom Properties in `src/styles/design-tokens.css`.
2.  **Integrate with Tailwind:** Extend Tailwind's theme in `tailwind.config.js` to use these CSS variables. This allows you to use Tailwind's utility classes (e.g., `bg-primary`, `text-accent`) while keeping your design system centralized in CSS.

**Example (`tailwind.config.js`):**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
      },
    },
  },
};
```

## 6. Route-Based Code Splitting

Only load the CSS needed for the current page.

*   **Implementation:** In your `vite.config.js`, use the `rollupOptions.output.manualChunks` function to create separate CSS chunks for each route. This dramatically reduces the initial CSS payload for any given page.

## 7. Production Optimization

Configure a `postcss.config.js` file for advanced production builds.

*   **Tailwind CSS JIT:** This is the most important optimization. Ensure your `tailwind.config.js` has the `content` property correctly configured to scan all relevant files for class names. This will purge all unused utilities.
*   **cssnano:** Use this PostCSS plugin to aggressively minify the final CSS bundle, removing comments, whitespace, and merging rules.
*   **Autoprefixer:** Automatically adds vendor prefixes to your CSS for broader browser compatibility.

## 8. Naming Conventions & Custom CSS

*   **Prioritize Utility Classes:** Strive to implement 90-95% of your styling using Tailwind's utility classes directly in your HTML/JS components.
*   **Use `@apply` for Reusable Components:** For custom components like buttons or cards where a long string of utilities is repeated, use `@apply` in a dedicated CSS file (e.g., `src/styles/components/buttons.css`) to create a component class.
*   **Use BEM for Complex Cases:** For highly complex, stateful components where utilities and `@apply` fall short, use the BEM (Block__Element--Modifier) naming convention for custom classes. This should be the exception, not the rule.

By following these guidelines, you will create a CSS architecture that is not only fast and efficient, but also a pleasure to work with as the project grows.