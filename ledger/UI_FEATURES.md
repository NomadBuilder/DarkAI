# The Ledger — UI Features & Design

## 🎨 Design Philosophy

**Cinematic, not dashboard.**
**Emotional discovery, not data dump.**

## Core Visual Experience

### LedgerCanvas Visualization
- **D3 Force-Directed Graph**: Interactive node visualization
- **Real-time Data**: Loads from processed JSON files
- **Smooth Transitions**: Nodes fade in/out as years change
- **Color Coding**:
  - 🔵 Blue: Public institutions
  - 🟢 Green: Non-profit organizations  
  - 🔴 Red: For-profit vendors
  - ⚪ Gray: Unclassified
- **Size Encoding**: Node size = payment amount
- **Performance**: Limited to top 500 vendors, optimized rendering
- **Lens Filtering**: Focus on staffing, consulting, or healthcare
- **Receipts Mode**: Click nodes to view detailed payment data

### Scroll-Driven Narrative

**Section 0 — Cold Open**
- Large, calm typography
- Establishes baseline: "This is how it's supposed to work"
- Minimal motion, neutral palette

**Section 1 — The Drift Begins**
- Year counter synchronized with scroll
- Subtle unease: "Something is drifting"
- Visualization begins to show private nodes

**Section 2 — The Ledger (Core)**
- 300vh scroll section
- Canvas visualization evolves with scroll
- Year advances 2014 → 2024
- Private clusters grow, public clusters shift

**Section 3 — Naming the Shift**
- Declarative statements
- "These are private, for-profit providers"
- No accusations, just naming

**Section 4 — Focus Lenses**
- Three interactive lenses
- Hover to filter visualization
- Staffing, Consulting, Healthcare
- Each with specific narrative angle

**Section 5 — Loss Framing**
- Dark background (slate-900)
- White text for contrast
- Emotional peak statements
- "This wasn't announced. It was invoiced."

**Section 6 — Receipts Mode**
- Toggle button in bottom-right
- Overlay with detailed vendor cards
- Click nodes in visualization to view
- Exact amounts, years, ministries

**Section 7 — Ending**
- Three unavoidable facts
- Large typography
- Designed for screenshots
- Source attribution

## Typography System

- **Font**: Inter (300-700 weights)
- **Display Text**: 6xl-8xl, font-light (300)
- **Body Text**: xl-2xl, font-light (300)
- **Letter Spacing**: Tight (-0.03em)
- **Line Height**: Relaxed (1.7)

## Color Palette

- **Public**: `#3b82f6` (Blue)
- **Non-Profit**: `#10b981` (Green)
- **For-Profit**: `#ef4444` (Red)
- **Unknown**: `#94a3b8` (Gray)
- **Background**: White → Slate gradients
- **Text**: Gray-900 (primary), Gray-600 (secondary)

## Animations & Transitions

- **Framer Motion**: All section animations
- **Scroll-Driven**: Year changes, opacity, scale
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` (smooth, natural)
- **Duration**: 0.6-1.0s for major transitions
- **Stagger**: Sequential reveals with delays

## Interactive Features

### Year Controller
- Fixed top-center
- Shows current year
- Smooth number transitions
- Backdrop blur effect

### Receipts Toggle
- Bottom-right corner
- Toggles receipts mode
- Canvas becomes clickable
- Overlay appears

### Lens Hover
- Hover over lens titles
- Filters visualization
- Shows only relevant vendors
- Smooth transition

### Methodology Drawer
- Slide-in from right
- Full methodology explanation
- Data source links
- Classification rules

## Performance Optimizations

- **Canvas Rendering**: RequestAnimationFrame
- **Vendor Limiting**: Top 500 by payment amount
- **Lazy Loading**: Data loaded on mount
- **Scroll Throttling**: requestAnimationFrame for scroll handler
- **Node Caching**: Reuse positions for smooth transitions

## Responsive Design

- **Mobile**: Smaller text, adjusted spacing
- **Tablet**: Medium sizes
- **Desktop**: Full experience
- **Breakpoints**: Tailwind defaults (sm, md, lg)

## Accessibility

- **Keyboard Navigation**: All interactive elements
- **Screen Readers**: Semantic HTML
- **Color Contrast**: WCAG AA compliant
- **Focus States**: Visible focus indicators

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Canvas API required
- ES6+ JavaScript
- CSS Grid & Flexbox
