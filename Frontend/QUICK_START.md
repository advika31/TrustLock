# Quick Start: TrustLock UI Overhaul

## View the New Design

```bash
# Start dev server
npm run dev

# Open browser to UI showcase
http://localhost:3000/ui-kit
```

## New Components

### Layout

- **Sidebar** — Collapsible vertical nav with icons + labels
- **Header** — Search, notifications, user menu (glass design)
- **InspectorPanel** — Right-side tabbed detail panel

### Features

- **OverviewCards** — 4 KPI cards with metrics and trends
- **ReviewList** — Scrollable case list with risk meters

## Using in Your Page

```tsx
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { OverviewCards } from '@/components/OverviewCards';
import { ReviewList } from '@/components/ReviewList';

export default function MyDashboard() {
  return (
    <>
      <Sidebar navItems={[...]} />
      <Header notifications={5} userName="John" />
      <main>
        <OverviewCards cards={kpiData} />
        <ReviewList cases={caseData} onReview={handleReview} />
      </main>
    </>
  );
}
```

## Design Tokens

All styling uses CSS variables from `styles/theme.css`:

```scss
background: var(--card-bg);
border: 1px solid var(--border-1);
padding: var(--gap-md); // 16px
border-radius: var(--radius-md); // 12px
color: var(--text-primary);
transition: all var(--transition-base); // 160ms
```

## Key Design Values

| Token          | Value                                  |
| -------------- | -------------------------------------- |
| Primary accent | `#ff5470` (pink)                       |
| Page bg        | `#0f1724` (navy)                       |
| Card bg        | `rgba(255,255,255,0.03)` (translucent) |
| Text primary   | `#e6eef8` (off-white)                  |
| Gap (standard) | `16px`                                 |
| Radius         | `12px`                                 |

## Testing

```bash
# Check contrast compliance
npm run theme:check

# Run tests
npm run test

# Lint code
npm run lint
```

## Responsive Breakpoints

```
Desktop (1440px+): 3-column (sidebar + main + inspector)
Tablet (768px):    2-column (collapsed sidebar + main)
Mobile (<480px):   1-column (drawer nav, modal panels)
```

## Keyboard Navigation

- **Tab** — Move focus forward
- **Shift+Tab** — Move focus backward
- **Enter** — Activate button/link
- **Escape** — Close modals/panels

## Component Props

### Sidebar

```tsx
<Sidebar
  navItems={[
    { href: '/dashboard', label: 'Dashboard', icon: <Icon />, badge: 5 }
  ]}
  onCollapsedChange={(isCollapsed) => {...}}
/>
```

### Header

```tsx
<Header
  notifications={5}
  userName="John Doe"
  userAvatar="https://..."
  onSearch={(query) => {...}}
/>
```

### OverviewCards

```tsx
<OverviewCards
  cards={[
    { id: 'kpi-1', label: 'Metric', value: '123', delta: 5, trend: 'up', icon: <Icon /> },
  ]}
/>
```

### ReviewList

```tsx
<ReviewList
  cases={[
    { id: 'case-1', name: 'John', method: 'Passport', riskLevel: 'high', riskScore: 78 }
  ]}
  onReview={(caseId) => {...}}
/>
```

### InspectorPanel

```tsx
<InspectorPanel
  isOpen={true}
  onClose={() => {...}}
  caseDetails={{
    id: 'case-123',
    riskScore: 67,
    riskLevel: 'medium',
    status: 'Pending',
    xaiFactors: [{ label: 'Face Match', weight: 0.8 }]
  }}
  onApprove={(id) => {...}}
  onReject={(id) => {...}}
/>
```

## Documentation

- **Design guidelines**: `docs/design-notes.md`
- **Full README**: `UI_OVERHAUL_README.md`
- **Completion summary**: `UI_OVERHAUL_COMPLETION_SUMMARY.md`

## Need Help?

1. Check the live UI showcase: `http://localhost:3000/ui-kit`
2. Read design guidelines: `docs/design-notes.md`
3. Review component source: `components/Layout/`, `components/*.tsx`
4. Run tests for examples: `npm run test -- Sidebar.test.tsx`

---

**Status**: ✅ All core components ready. Responsive, accessible, contrast-verified.
