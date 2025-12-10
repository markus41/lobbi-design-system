# Similar Styles Feature

## Overview

The Similar Styles feature adds a fixed bottom bar to all 210 style pages showing 3-4 related styles based on shared tags. This helps users discover and navigate between related design systems.

## Implementation

### Script Location
- **File**: `scripts/add-similar-styles.js`
- **Run**: `node scripts/add-similar-styles.js`

### Algorithm

The similarity algorithm works as follows:

1. **Tag Matching**: Find styles with at least 1 shared tag
2. **Scoring System**:
   - Shared tag: +10 points per shared tag
   - Primary tag match: +5 bonus points
3. **Sorting**: Sort by score (highest first), then by style number
4. **Selection**: Select top 4 similar styles

### Example

For **Byzantine Luxury** (tags: `premium`, `heritage`):
- **Byzantine Contemporary** - Tags: `premium`, `heritage` (2 matches) → Score: 25
- **Quiet Luxury** - Tags: `premium` (1 match) → Score: 10
- **Dark Academia** - Tags: `premium`, `academic` (1 match) → Score: 10
- **Corporate Refinement** - Tags: `premium`, `professional` (1 match) → Score: 10

## Visual Design

### Layout
- **Position**: Fixed bottom bar (z-index: 999)
- **Background**: `rgba(0, 0, 0, 0.95)` with backdrop blur
- **Height**: Auto (adapts to content)

### Style Cards
- **Size**: 120px × 75px thumbnail
- **Preview**: Color gradient generated from style metadata
- **Hover**: Blue text highlight
- **Layout**: Horizontal scrollable flex grid

### CSS Classes
```css
.similar-styles-section    /* Container */
.similar-styles-title      /* "Similar Styles" heading */
.similar-styles-grid       /* Flex container for cards */
.similar-style-card        /* Individual card link */
.similar-preview           /* Thumbnail gradient */
.similar-name             /* Style name text */
```

## Gradient Generation

Each style gets a unique deterministic gradient based on:
- **Hue**: Golden angle distribution (137.5° × style number)
- **Saturation**: 70% for premium styles, 50% for others
- **Lightness**: 40% for heritage/academic, 50% for others

This ensures:
- Consistent colors across sessions
- Visual variety between styles
- Semantic meaning (darker for traditional styles)

## Features

✅ **Tag-Based Similarity**: Intelligent matching based on design categories
✅ **Fixed Bottom Bar**: Always visible, doesn't obstruct content
✅ **Hover Effects**: Interactive feedback on card hover
✅ **Responsive**: Horizontal scroll on smaller screens
✅ **Performance**: Pre-generated, no runtime computation
✅ **Accessibility**: Proper link semantics and focus states

## Status

- **Total Styles**: 210
- **Coverage**: 100% (all style pages updated)
- **Similar Styles per Page**: 4 (or fewer if insufficient matches)
- **Minimum Shared Tags**: 1

## Files Modified

All 210 style HTML files:
- `style-1-byzantine-luxury.html` through `style-210-sustainable-digital.html`

Each file received:
1. CSS for similar styles section (added to `<style>` tag)
2. HTML for similar styles bar (added before `</body>`)

## Maintenance

To update similar styles:
1. Modify tag assignments in `index.html`
2. Run `node scripts/add-similar-styles.js`
3. Script will skip files that already have the feature
4. To force update, remove the "Similar Styles Section" comment from files

## Testing

Run the algorithm test:
```bash
cd scripts
node -e "const {extractStyleData, findSimilarStyles} = require('./add-similar-styles.js'); \
  const styles = extractStyleData(); \
  const testStyle = styles[0]; \
  const similar = findSimilarStyles(testStyle, styles, 4); \
  console.log('Similar to', testStyle.name + ':', similar.map(s => s.name).join(', '));"
```

## Future Enhancements

Potential improvements:
- [ ] Add "Recently Viewed" styles integration
- [ ] Include style preview on hover
- [ ] Add keyboard navigation (arrow keys to scroll)
- [ ] Show shared tags as visual indicators
- [ ] Add "View All Similar" link to filtered gallery
- [ ] Implement similarity score display
- [ ] Add animation on page load
