# Design System Style Generator

Create production-ready design system styles using the ULTRATHINK methodology with comprehensive documentation, component architecture, and accessibility compliance.

## Purpose

Automates the creation of new design system styles for the Lobbi Design System Gallery, ensuring consistency with established patterns while enabling creative exploration. Uses ULTRATHINK methodology to produce comprehensive, well-documented, production-ready style files.

## Multi-Agent Coordination Strategy

Uses **hierarchical decomposition pattern** with specialized agents for analysis, design, implementation, and validation.

### Architecture
```
┌──────────────────────────────────────────────────┐
│        Design System Orchestrator                │
│        (design-strategist)                       │
└────────────┬─────────────────────────────────────┘
             │
    ┌────────┼────────┬────────┬────────┬─────────┐
    ▼        ▼        ▼        ▼        ▼         ▼
 Analyze  Design   Implement Validate Document  Integrate
 Gaps     Blend    Style     Quality  ULTRA     Gallery
                                      THINK
```

## Execution Flow

### Phase 1: Analysis (0-5 mins)
1. **gap-analyzer** - Analyze existing gallery for style gaps
2. **category-mapper** - Map style categories and coverage
3. **blend-advisor** - Suggest optimal blend compositions

### Phase 2: Design Specification (5-15 mins)
4. **blend-designer** - Create detailed blend specification
5. **color-psychologist** - Define color palette with semantic meaning
6. **typography-strategist** - Select font pairings and hierarchy
7. **component-architect** - Plan 8 core component implementations

### Phase 3: ULTRATHINK Documentation (15-25 mins)
8. **ultrathink-writer** - Generate comprehensive design analysis
   - Blend Chemistry (compatibility, tension, harmony)
   - Color Psychology & Semantics
   - Typography Strategy
   - Spatial Density
   - Component Architecture
   - Accessibility Compliance
   - Temperature & Formality scoring

### Phase 4: Implementation (25-40 mins)
9. **style-implementer** - Create HTML/CSS implementation
10. **component-builder** - Build all 8 core components:
    - Header with navigation
    - Stats/metrics grid (4 cards)
    - Content cards
    - Data table (filterable)
    - Form elements
    - Buttons (primary/secondary/tertiary)
    - Badges/status indicators
    - Footer with links

### Phase 5: Quality Assurance (40-50 mins)
11. **accessibility-auditor** - Verify WCAG 2.1 AA compliance
12. **responsive-tester** - Test breakpoints (768px, 1024px)
13. **component-validator** - Validate all 8 components present
14. **contrast-checker** - Verify color contrast ratios

### Phase 6: Integration (50-60 mins)
15. **navigation-integrator** - Inject gallery navigation
16. **index-updater** - Update index.html with new style
17. **nav-updater** - Update add-nav.js mappings
18. **documentation-updater** - Update Obsidian vault

## Agent Coordination Layers

### Strategic Layer
- **design-strategist**: Overall design direction and gap analysis
- **blend-advisor**: Style blend composition recommendations
- **category-mapper**: Gallery organization and coverage

### Design Layer
- **color-psychologist**: Color theory and semantic meaning
- **typography-strategist**: Font selection and hierarchy
- **component-architect**: Component structure and patterns

### Implementation Layer
- **style-implementer**: HTML/CSS code generation
- **component-builder**: Core component implementation
- **ultrathink-writer**: Design documentation generation

### Quality Layer
- **accessibility-auditor**: WCAG compliance validation
- **contrast-checker**: Color accessibility verification
- **responsive-tester**: Breakpoint testing

### Integration Layer
- **navigation-integrator**: Gallery navigation injection
- **index-updater**: Gallery index updates
- **documentation-updater**: Documentation sync

## Usage Examples

### Example 1: Create Single 2-Way Blend Style
```
/design-system --blend="Minimalism 60% + Wellness 40%" --name="Minimal Wellness" --vertical=wellness

Output:
✅ Gap Analysis: Wellness-minimalism combination underrepresented
✅ Blend Specification: Designed with Temperature 8/10, Formality 5/10
✅ ULTRATHINK Documentation: Complete (2,400 lines)
✅ Components: 8/8 implemented
✅ Accessibility: WCAG 2.1 AA compliant
✅ Integration: Added to gallery as Style 141

Created: style-141-minimal-wellness.html (48KB)
```

### Example 2: Generate Multiple Styles
```
/design-system --count=5 --category=association --complexity=2-way

Output:
Analyzing gallery for association category gaps...

Generating 5 new 2-way blend styles:
1. Style 141: Membership Harmony (Community 65% + Zen 35%)
2. Style 142: Professional Connect (Network 60% + Corporate 40%)
3. Style 143: Association Trust (Institution 55% + Modern 45%)
4. Style 144: Member Circle (Collective 70% + Social 30%)
5. Style 145: Guild Excellence (Craft 60% + Premium 40%)

All styles created with ULTRATHINK documentation and 8 components.
```

### Example 3: Create 4+ Way Experimental Blend
```
/design-system --blend="Government 35% + Startup 25% + Swiss 20% + Glass 20%" --name="Civic Innovation" --experimental

Output:
Creating 4-way experimental blend with extended ULTRATHINK...

✅ Blend Chemistry Analysis:
   - Compatibility Matrix: 8.2/10
   - Tension Points: Government formality vs. Startup casual (resolved)
   - Harmony Zones: Swiss precision + Glass modernity

✅ Created: style-146-civic-innovation.html
```

### Example 4: Style from Vertical Specification
```
/design-system --vertical=healthcare --temperature=3 --formality=9

Output:
Analyzing healthcare vertical requirements...

Recommended blend: Clinical Precision 65% + Trust Professional 35%
- Background: #f8fafb (Clinical white)
- Primary: #0077b6 (Healthcare trust blue)
- Secondary: #2e7d32 (Medical success green)

Proceed with generation? [Y/n]: Y

✅ Created: style-147-healthcare-precision.html
```

### Example 5: Batch Generation with ULTRATHINK
```
/design-system --batch --from-spec=styles.yaml --effort=ultrathink

Processing styles.yaml (3 styles):
1. ✅ Style 148: Legal Authority (2-way) - 45KB
2. ✅ Style 149: Financial Trust (2-way) - 47KB
3. ✅ Style 150: Academic Research (3-way) - 52KB

All styles include:
- Full ULTRATHINK documentation
- 8 core components
- WCAG 2.1 AA compliance
- Gallery navigation
- Index integration
```

## Expected Outputs

### 1. Style HTML File
Generated at: `style-[N]-[name].html`

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>[Style Name] - Lobbi Design System</title>
    <link href="[Google Fonts]" rel="stylesheet">
    <style>
        /*
        ╔═══════════════════════════════════════════════════════════════╗
        ║  ULTRATHINK DESIGN ANALYSIS: [STYLE NAME]                     ║
        ╠═══════════════════════════════════════════════════════════════╣
        ║  [N]-WAY BLEND COMPOSITION:                                   ║
        ║  • Primary (XX%): [Style A] - [Function]                      ║
        ║  • Secondary (XX%): [Style B] - [Function]                    ║
        ║  ...                                                          ║
        ║                                                               ║
        ║  BLEND CHEMISTRY:                                             ║
        ║  • Compatibility Matrix: [Analysis]                           ║
        ║  • Tension Points: [Resolutions]                              ║
        ║  • Harmony Zones: [Synergies]                                 ║
        ║                                                               ║
        ║  COLOR PSYCHOLOGY: [Semantic meanings]                        ║
        ║  TYPOGRAPHY STRATEGY: [Font rationale]                        ║
        ║  SPATIAL DENSITY: [Layout philosophy]                         ║
        ║  ACCESSIBILITY: [WCAG compliance]                             ║
        ║                                                               ║
        ║  TEMPERATURE: X/10 | FORMALITY: Y/10                          ║
        ╚═══════════════════════════════════════════════════════════════╝
        */

        :root {
            /* Color system */
            /* Typography */
            /* Spacing */
        }

        /* Component styles... */
    </style>
</head>
<body>
    <!-- Gallery Navigation (auto-injected) -->
    <!-- Header -->
    <!-- Stats Grid -->
    <!-- Content Cards -->
    <!-- Data Table -->
    <!-- Forms -->
    <!-- Buttons -->
    <!-- Badges -->
    <!-- Footer -->
</body>
</html>
```

### 2. Gallery Integration
- `index.html` updated with new style entry
- `add-nav.js` styleNameMap updated
- Navigation injected into style file

### 3. Documentation Update
- Obsidian vault `lobbi-design-system.md` updated
- Style categories updated
- Audit history logged

## Configuration Options

### Blend Configuration
- `--blend="Style1 X% + Style2 Y%"` - Explicit blend specification
- `--complexity=2-way|3-way|4-way|5-way` - Blend complexity level
- `--experimental` - Enable 4+ way experimental blends

### Style Properties
- `--name="Style Name"` - Style display name
- `--vertical=industry` - Target industry vertical
- `--temperature=1-10` - Warmth level (1=cool, 10=warm)
- `--formality=1-10` - Formality level (1=casual, 10=formal)

### Color Configuration
- `--background=#hex` - Primary background color
- `--accent=#hex` - Primary accent color
- `--palette=warm|cool|neutral` - Color temperature palette

### Generation Options
- `--count=N` - Generate multiple styles
- `--batch` - Batch mode from YAML spec
- `--from-spec=file.yaml` - YAML specification file
- `--effort=ultrathink` - Full ULTRATHINK documentation

### Output Options
- `--dry-run` - Preview without writing files
- `--output=path` - Custom output directory
- `--skip-integration` - Skip gallery integration
- `--skip-nav` - Skip navigation injection

## ULTRATHINK Methodology

### Required Documentation Sections

1. **Blend Composition**
   - Primary influence with percentage and function
   - Secondary influence with percentage and function
   - Additional influences (for 3+ way blends)

2. **Blend Chemistry**
   - Compatibility Matrix (how styles work together)
   - Tension Points (where styles conflict and resolution)
   - Harmony Zones (where styles reinforce each other)
   - Overall Compatibility Score (1-10)

3. **Color Psychology & Semantics**
   - Each CSS variable with hex and meaning
   - Psychological impact of color choices
   - Cultural considerations

4. **Typography Strategy**
   - Display/heading font with rationale
   - Body font with readability analysis
   - Font pairing justification
   - Hierarchy definition

5. **Spatial Density**
   - Base spacing unit
   - Grid system approach
   - Whitespace philosophy
   - Component spacing rationale

6. **Component Architecture**
   - All 8 core components listed
   - Component-specific design decisions
   - Interaction states defined

7. **Accessibility Compliance**
   - WCAG level targeted (AA minimum)
   - Contrast ratios documented
   - Focus states defined
   - Keyboard navigation support

8. **Temperature & Formality**
   - Temperature score (1-10) with description
   - Formality score (1-10) with description
   - Target audience implications

## Success Criteria

- ✅ Style file created with valid HTML/CSS
- ✅ ULTRATHINK documentation complete (all 8 sections)
- ✅ All 8 core components implemented
- ✅ WCAG 2.1 AA compliance verified
- ✅ Responsive breakpoints working (768px, 1024px)
- ✅ Gallery navigation injected
- ✅ index.html updated with new style
- ✅ add-nav.js styleNameMap updated
- ✅ Obsidian documentation updated
- ✅ Color contrast ratios verified (4.5:1+ for text)
- ✅ Google Fonts properly loaded
- ✅ CSS custom properties defined in :root

## Component Requirements

### 8 Core Components (Required)

| # | Component | Requirements |
|---|-----------|--------------|
| 1 | Header | Logo, navigation links, responsive menu |
| 2 | Stats Grid | 4 metric cards with values and labels |
| 3 | Content Cards | Member/item cards with image, title, metadata |
| 4 | Data Table | Filterable, sortable, with search |
| 5 | Form Elements | Inputs, selects, textareas, validation states |
| 6 | Buttons | Primary, secondary, tertiary variants |
| 7 | Badges | Status indicators, tags, labels |
| 8 | Footer | Multi-column links, copyright |

## Notes

- **ULTRATHINK Effort**: Full documentation adds ~10 minutes but ensures quality
- **Blend Limits**: 2-way blends are most stable; 4+ way requires careful balancing
- **Temperature Guide**: 1-3 (clinical), 4-6 (professional), 7-10 (warm/creative)
- **Formality Guide**: 1-3 (casual), 4-6 (modern professional), 7-10 (formal/traditional)
- **Accessibility**: Always target WCAG 2.1 AA minimum; AAA for government/accessibility verticals
- **File Size**: Typical styles range 40-60KB depending on component complexity
- **Gallery Limit**: Current system supports up to 200 styles efficiently

## YAML Specification Format

For `--from-spec` batch generation:

```yaml
# styles-spec.yaml
styles:
  - name: "Minimal Wellness"
    number: 141
    blend:
      - style: "Zen Minimalism"
        percentage: 60
      - style: "Wellness Design"
        percentage: 40
    vertical: wellness
    temperature: 8
    formality: 5
    colors:
      background: "#f5f3f0"
      primary: "#6ca575"
      secondary: "#e8a87c"
    typography:
      heading: "Nunito"
      body: "Inter"

  - name: "Heritage Modernist"
    number: 142
    blend:
      - style: "Architectural Heritage"
        percentage: 65
      - style: "Contemporary Minimalism"
        percentage: 35
    vertical: heritage
    temperature: 4
    formality: 8
    colors:
      background: "#f9f7f3"
      primary: "#5a4a42"
      secondary: "#8b7355"
```

## Estimated Execution Time

| Task | Time |
|------|------|
| Single 2-way style | 8-12 minutes |
| Single 3-way style | 12-18 minutes |
| Single 4+ way style | 18-25 minutes |
| Batch (5 styles) | 25-40 minutes |
| Full ULTRATHINK effort | +5-10 minutes |
