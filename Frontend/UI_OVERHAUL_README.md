# TrustLock Frontend UI Overhaul

## Overview

This document describes the UI overhaul of the TrustLock KYC verification dashboard, implementing a modern, premium dashboard design inspired by leading KYC platforms. The redesign emphasizes visual hierarchy, accessibility, and refined micro-interactions using a dark theme with vibrant accent colors.

## Design Philosophy

- **Dark-first theme**: Premium, professional appearance suitable for compliance and financial verticals
- **Semantic color tokens**: Centralized in `styles/theme.css` using CSS variables
- **Accessibility first**: WCAG AA compliance, keyboard navigation, focus indicators
- **Responsive design**: Desktop 3-column, tablet 2-column, mobile 1-column layouts
- **Micro-interactions**: Smooth transitions, hover effects, and visual feedback

## New Components

### Layout Components

1. **`components/Layout/Sidebar.tsx`** — Collapsible left navigation
   - Vertical nav with icons + labels
   - Active state with gradient pill highlight
   - Collapse to icons-only mode with tooltips
   - Keyboard accessible with ARIA attributes
   - Badge support for notification counts

2. **`components/Layout/Header.tsx`** — Premium sticky header
   - Centered search input
   - Notifications bell with badge
   - Language switcher
   - User avatar dropdown menu
   - Glass morphism background with backdrop blur

3. **`components/Layout/InspectorPanel.tsx`** — Right-side detail panel
   - Tabbed interface (Details, Documents, Timeline, XAI, Audit)
   - Risk score display with circular progress
   - XAI factor visualization with weighted bars
   - Action buttons (Approve, Request Info, Reject)
   - Micro-confirmation before irreversible actions
   - Full-screen modal on mobile, 560px panel on desktop

### Feature Components

4. **`components/OverviewCards.tsx`** — KPI cards section
   - 4-column grid with icons, metrics, and delta badges
   - Trend indicators (↑↓→) with color coding
   - Hover lift effect (translateY -6px)
   - Responsive: 2-col tablet, 1-col mobile

5. **`components/ReviewList.tsx`** — Cases pending review
   - Vertical stack of case cards
   - Thumbnail (96x96), case info, risk meter, review button
   - Empty state and loading states
   - Risk level color coding
   - Accessible semantic HTML

### UI Kit & Demo

6. **`app/ui-kit/page.tsx`** — Component showcase
   - Live component demonstrations
   - Design token gallery (colors, typography, spacing)
   - Testing checklist
   - Access at: `/ui-kit` (or port 3001 with `npm run ui:preview`)

## Design Tokens

All styling is driven by centralized CSS variables in `styles/theme.css`:

### Colors

```css
/* Accent colors */
--color-accent-1: #ff5470; /* Pink - primary CTA */
--color-accent-2: #7a5cff; /* Purple - secondary CTA */
--color-accent-3: #4f46e5; /* Indigo - links, focus */

/* Risk scale */
--risk-low: #14b8a6; /* Teal - safe */
--risk-med: #f59e0b; /* Amber - warning */
--risk-high: #ff3860; /* Red - alert */

/* Backgrounds */
--bg-page: #0f1724;
--card-bg: rgba(255, 255, 255, 0.03);
--glass-bg: rgba(255, 255, 255, 0.04);

/* Text */
--text-primary: #e6eef8;
--text-secondary: #9fb0c8;
--text-muted: #6f8597;
```

### Spacing (multiples of 8px)

```css
--gap-sm: 8px; /* Small gaps */
--gap-md: 16px; /* Standard padding */
--gap-lg: 24px; /* Large sections */
```

### Radius

```css
--radius-md: 12px; /* Standard cards */
--radius-sm: 8px; /* Small buttons */
--radius-pill: 9999px; /* Full round */
```

### Typography

```css
--font-family-sans: 'Inter'; /* Body text */
--font-family-head: 'Poppins'; /* Headlines */

--type-h1: 32px;
--type-h2: 24px;
--type-h3: 20px;
--type-base: 14px;
--type-small: 12px;
```

### Transitions

```css
--transition-fast: 120ms; /* Hover feedback */
--transition-base: 160ms; /* Standard animations */
--transition-slow: 240ms; /* Modal animations */
```

## Key Features

### Responsive Layout

| Desktop                               | Tablet                              | Mobile                       |
| ------------------------------------- | ----------------------------------- | ---------------------------- |
| 3-column (Sidebar + Main + Inspector) | 2-column (collapsed sidebar + main) | 1-column (stacked)           |
| Sidebar: 260px fixed                  | Sidebar: 80px collapsible           | Sidebar: drawer/modal        |
| Inspector: 560px panel                | Inspector: full-width modal         | Inspector: full-height modal |

### Hover & Focus States

- **Cards**: `translateY(-6px)` + shadow lift
- **Buttons**: `translateY(-2px)` + color/opacity shift
- **Focus ring**: `outline: 3px solid var(--focus-ring)` with 2px offset

### Accessibility

- ✓ WCAG AA contrast ratio (4.5:1 body, 3:1 large text)
- ✓ Keyboard navigation (Tab, Enter, Escape)
- ✓ ARIA labels and `aria-current` for active items
- ✓ Semantic HTML (`<button>`, `<a>`, `<nav>`)
- ✓ Respects `prefers-reduced-motion`
- ✓ Focus indicators on all interactive elements

### Micro-interactions

- Smooth sidebar collapse with width + opacity transition
- Card lift on hover with shadow enhancement
- Inspector panel slide-in from right (desktop) / fade-in modal (mobile)
- Confirmation modals for destructive actions
- XAI factor bars animate width on load
- Toast notifications with auto-dismiss (future)

## File Structure

```
Frontend/
├── styles/
│   ├── theme.css          # NEW: Centralized design tokens
│   ├── globals.scss       # UPDATED: Imports theme.css
│   ├── variables.scss     # UPDATED: Non-color tokens
│   └── design-notes.md    # NEW: Design guidelines
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx               # NEW
│   │   ├── Sidebar.module.scss       # NEW
│   │   ├── Header.tsx                # NEW
│   │   ├── Header.module.scss        # NEW
│   │   ├── InspectorPanel.tsx        # NEW
│   │   └── InspectorPanel.module.scss # NEW
│   ├── OverviewCards.tsx             # NEW
│   ├── OverviewCards.module.scss     # NEW
│   ├── ReviewList.tsx                # NEW
│   └── ReviewList.module.scss        # NEW
├── app/
│   └── ui-kit/
│       ├── page.tsx           # NEW: Showcase page
│       └── page.module.scss   # NEW: Showcase styles
├── __tests__/
│   └── components/
│       ├── Sidebar.test.tsx   # NEW: Keyboard nav, ARIA tests
│       └── CaseCard.test.tsx  # NEW: Accessibility tests
├── docs/
│   └── design-notes.md        # NEW: Comprehensive design guidelines
└── package.json               # UPDATED: Added "ui:preview" script
```

## How to Use These Components

### Layout Integration

```tsx
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { InspectorPanel } from '@/components/Layout/InspectorPanel';

export default function DashboardLayout() {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseDetails | null>(null);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', minHeight: '100vh' }}>
      <Sidebar navItems={navItems} onCollapsedChange={handleCollapse} />
      <div style={{ display: 'grid', gridTemplateRows: '70px 1fr' }}>
        <Header notifications={5} userName="John Doe" />
        <main>{/* Your dashboard content */}</main>
      </div>
      <InspectorPanel
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        caseDetails={selectedCase}
        onApprove={handleApprove}
        onRequestInfo={handleRequestInfo}
        onReject={handleReject}
      />
    </div>
  );
}
```

### Using Design Tokens in Components

All component styles use CSS variables:

```scss
// components/MyCard.module.scss
.card {
  background: var(--card-bg);
  border: 1px solid var(--border-1);
  border-radius: var(--radius-md);
  padding: var(--gap-md);
  box-shadow: var(--shadow-1);
  transition: all var(--transition-base);

  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-2);
  }

  &:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }
}
```

### KPI Cards

```tsx
import { OverviewCards } from '@/components/OverviewCards';

const kpiCards = [
  {
    id: 'onboarded',
    label: 'Onboarded Today',
    value: '234',
    delta: 12,
    trend: 'up',
    icon: <CheckIcon />,
  },
  // ... more cards
];

export default function Dashboard() {
  return <OverviewCards cards={kpiCards} />;
}
```

### Review List

```tsx
import { ReviewList } from '@/components/ReviewList';

const casesToReview = [
  {
    id: 'case-001',
    name: 'John Doe',
    method: 'Passport Scan',
    riskLevel: 'high',
    riskScore: 78,
    tags: ['PEP', 'Sanctions'],
  },
  // ... more cases
];

export default function ReviewQueue() {
  const handleReview = (caseId) => {
    // Open inspector panel
  };

  return <ReviewList cases={casesToReview} onReview={handleReview} />;
}
```

## Backend Integration Notes

All components accept data through props:

- **Sidebar**: `navItems` array with `{ href, label, icon, badge? }`
- **Header**: `notifications`, `userName`, `userAvatar`
- **OverviewCards**: `cards` array with metrics and deltas from API
- **ReviewList**: `cases` array fetched from `/api/cases/pending`
- **InspectorPanel**: `caseDetails` object from case detail API
- Action callbacks (`onApprove`, `onReject`, etc.) should call backend APIs via `services/api.ts`

Keep business logic in API service layer; components remain presentational.

## Testing

### Run Tests

```bash
npm run test                    # Run all tests
npm run test:watch             # Watch mode
npm run lint                   # Lint check
npm run theme:check            # Verify color contrast
```

### Keyboard Navigation

- **Tab**: Move focus forward through interactive elements
- **Shift+Tab**: Move focus backward
- **Enter**: Activate buttons/links
- **Escape**: Close modals/panels
- **Arrow keys**: Navigate select/menu items

### Contrast Verification

```bash
npm run theme:check
# Output: ✔ All checked color pairs meet contrast thresholds.
```

## UI Showcase

View all components live:

```bash
# Terminal 1: Start dev server on port 3000
npm run dev

# Terminal 2: Start UI preview on port 3001
npm run ui:preview

# Open browser to:
http://localhost:3000/ui-kit
```

## Migration Checklist

- [ ] Update existing pages to use new `Sidebar` and `Header` components
- [ ] Replace old dashboard layout with 3-column grid
- [ ] Connect `OverviewCards` to real KPI API endpoints
- [ ] Connect `ReviewList` to `/api/cases/pending` endpoint
- [ ] Wire `InspectorPanel` to case detail API and actions
- [ ] Update navigation URLs in `Sidebar` navItems
- [ ] Test keyboard navigation at all breakpoints
- [ ] Verify color contrast: `npm run theme:check`
- [ ] Test on real devices: mobile (320px), tablet (768px), desktop (1440px)
- [ ] Update documentation in ADR if applicable

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

Note: Uses CSS Grid, CSS Variables, Flexbox (widely supported).

## Performance Considerations

- CSS Modules: Scoped styles, no naming conflicts
- No external icon library dependency (use Heroicons or Lucide)
- Lazy load images in lists using `loading="lazy"`
- Inspector panel uses React state (no unnecessary re-renders)
- Transitions use `transition` (not animationFrame) for GPU acceleration

## Future Enhancements

- [ ] Add toast notification system
- [ ] Implement CaseTable component (paginated, sortable)
- [ ] Add Charts component (line chart + donut for risk distribution)
- [ ] Create DocumentViewer with split layout
- [ ] Implement Filters drawer
- [ ] Add XAI Trace component with interactive explanations
- [ ] Build component Storybook for design systems documentation
- [ ] Add dark/light theme toggle in Header

## References

- **Design Tokens**: `styles/theme.css`
- **Guidelines**: `docs/design-notes.md`
- **Component Examples**: `components/Layout/`, `components/OverviewCards.tsx`
- **Tests**: `__tests__/components/Sidebar.test.tsx`, `CaseCard.test.tsx`
- **Showcase**: `/ui-kit` page
- **Icons**: Heroicons (https://heroicons.com/)
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

## Questions?

Refer to `docs/design-notes.md` for comprehensive spacing, typography, and animation rules. All components follow the same patterns for consistency.

---

**Commit Message Suggestion**:

```
feat(ui): overhaul dashboard to modern KYC platform design

- Add premium dark theme with semantic color tokens (theme.css)
- Implement collapsible Sidebar with keyboard navigation and ARIA
- Create sticky Header with search, notifications, user menu
- Build right-side InspectorPanel with tabbed case details
- Add KPI OverviewCards and ReviewList components
- Implement responsive 3-col/2-col/1-col layouts
- Add UI showcase route at /ui-kit
- Include comprehensive design guidelines and accessibility tests
- Support WCAG AA contrast, reduced motion, keyboard nav
- Add npm script: ui:preview

Closes #[ticket-number]
```
