# SVG Asset Management

This directory contains extracted SVG graphics for better code organization and maintainability.

## SVG Extraction Pattern

When encountering large inline SVGs in Vue components (>50 lines), extract them using this pattern:

### 1. File Structure
```
src/assets/svg/
├── README.md           # This file
├── [component-name]-[element].svg  # Extracted SVG files
└── icons/             # Small icon SVGs (optional)
```

### 2. Extraction Steps

#### Step 1: Create the SVG file
- Copy the entire `<svg>` element and its contents
- Save to `src/assets/svg/[descriptive-name].svg`
- Ensure proper `viewBox` and `xmlns` attributes

#### Step 2: Replace in Vue component
Replace the inline SVG with:
```vue
<object data="/src/assets/svg/[filename].svg" 
        type="image/svg+xml" 
        class="[css-class]">
  <img src="/src/assets/svg/[filename].svg" 
       alt="[descriptive alt text]" 
       class="[fallback-css-class]" />
</object>
```

#### Step 3: Update CSS if needed
- The `<object>` tag maintains SVG styling capabilities
- CSS can still target the SVG through the object
- Fallback `<img>` ensures compatibility

### 3. Benefits

- **Reduced component size**: Dramatically reduces Vue component line count
- **Maintainability**: SVG changes don't require Vue component modifications  
- **Reusability**: SVGs can be reused across multiple components
- **Performance**: Better caching and loading optimization
- **Readability**: Cleaner component templates

### 4. Naming Convention

Use descriptive, kebab-case names:
- `apex-logo.svg` - Main Apex Legends logo
- `tournament-icon.svg` - Tournament specific icons
- `chart-legend-icon.svg` - Chart-related graphics

### 5. Current Extractions

- ✅ **apex-logo.svg** - Complex Apex Legends diamond skull logo (215 lines → 7 lines in component)

## Future Candidates

Identify SVGs in components that are:
- More than 50 lines
- Complex with multiple gradients/paths
- Reused across components
- Static (not dynamically generated)

Following this pattern will keep components clean and maintainable while preserving visual fidelity.