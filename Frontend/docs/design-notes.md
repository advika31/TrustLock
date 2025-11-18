# TrustLock Dashboard UI Design Guidelines

## Overview

This document provides guidelines for implementing the TrustLock KYC verification dashboard, inspired by modern premium dashboard design patterns. The design emphasizes visual hierarchy, accessibility, and micro-interactions using a dark theme with vibrant accent colors.

## Design Tokens

All design decisions are centralized in `styles/theme.css` using CSS variables. Always reference these variables rather than hardcoding colors, shadows, or spacing.

### Color Palette

- **Primary Accent**: `--color-accent-1: #ff5470` (Warm Pink) — Use for primary CTAs, active states
- **Secondary Accent**: `--color-accent-2: #7a5cff` (Purple) — Use for secondary CTAs, hover states
- **Tertiary Accent**: `--color-accent-3: #4f46e5` (Indigo) — Use for focus rings, links
- **Risk Low**: `--risk-low: #14b8a6` (Teal) — For "safe" status
- **Risk Medium**: `--risk-med: #f59e0b` (Amber) — For "warning" status
- **Risk High**: `--risk-high: #ff3860` (Red) — For "alert" status

### Spacing

Use the base gap of **16px** (`--gap-md`) as the foundation:

- `--gap-sm: 8px` — Small gaps between icons and text
- `--gap-md: 16px` — Standard padding and margins (use most often)
- `--gap-lg: 24px` — Large sections and containers

### Border Radius

- `--radius-md: 12px` — Standard card corners
- `--radius-sm: 8px` — Small buttons, tags
- `--radius-pill: 9999px` — Fully rounded buttons, badges

### Shadows

- `--shadow-1` — Standard elevation for cards
- `--shadow-2` — Elevated state (hover, focus)
- `--shadow-soft` — Subtle shadows for borders, dividers

### Typography

- **Headlines**: Use `--font-family-head: Poppins` with weights 600–700
- **Body**: Use `--font-family-sans: Inter` with weights 400–600
- **Scale**:
  - `--type-h1: 32px` — Page titles
  - `--type-h2: 24px` — Section headers
  - `--type-base: 14px` — Body text, labels
  - `--type-small: 12px` — Micro-copy, captions

### Transitions

Always use these predefined transitions for consistent micro-interactions:

- `--transition-fast: 120ms` — Quick feedback (hover states)
- `--transition-base: 160ms` — Standard transitions (transforms, fades)
- `--transition-slow: 240ms` — Slower animations (modals, panels)

## Component Hierarchy

### Level 1: Containers

- **Sidebar**: Fixed left navigation (collapsible on smaller screens)
- **Header**: Sticky top navigation with search and actions
- **Main Content**: Scrollable area with overview cards, tables, lists
- **Inspector Panel**: Right-side detail view (slides in on desktop, modal on mobile)

### Level 2: Feature Sections

- **Overview Cards** (KPIs): 4-column grid showing high-level metrics
- **Review List**: Vertical stack of case cards waiting for review
- **Case Table**: Data-dense paginated table with sortable columns
- **Case Details**: Tabbed inspector panel with documents, timeline, XAI trace

### Level 3: Atomic Components

- **Buttons**: Primary (gradient CTA), Secondary (outlined), Tertiary (text-only)
- **Badges**: Risk level indicators (low/medium/high)
- **Icons**: Use Heroicons or Lucide for consistency
- **Cards**: Consistent use of `--card-bg`, `--border-1`, `--shadow-1`

## Spacing & Layout Rules

1. **Base Grid**: All padding and margins must be multiples of 8px (use `--gap-*` variables)
2. **Card Padding**: Always use `var(--gap-md)` (16px) for internal card spacing
3. **Section Gaps**: Use `var(--gap-lg)` (24px) between major sections
4. **Icon Size**:
   - Header icons: 20px
   - Sidebar icons: 24px
   - Inline icons: 16px
   - Large icons (alerts): 32px+

## Micro-interactions & Animation

### Hover States

- **Cards**: `translateY(-6px)` + lift shadow (shadow-2)
- **Buttons**: `translateY(-2px)` + brighten/color shift
- **List items**: `translateY(-1px)` + background change

### Focus States

All interactive elements must have visible focus rings:

```css
&:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### Transitions

Use `var(--transition-base)` for most state changes. Example:

```scss
transition: all var(--transition-base);

&:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-2);
}
```

## Accessibility Requirements

1. **Color Contrast**: All text must meet WCAG AA standards (4.5:1 for body, 3:1 for large text)
   - Verify using `npm run theme:check`
2. **Keyboard Navigation**: Tab order must be logical; all buttons/links focusable
3. **ARIA Labels**:
   - Use `aria-label` for icon-only buttons
   - Use `aria-current="page"` for active nav items
   - Use `role="tab"` and `aria-selected` for tab controls
4. **Semantic HTML**: Prefer `<button>`, `<a>`, `<input>` over `<div>` with click handlers
5. **Reduced Motion**: Respect `@media (prefers-reduced-motion: reduce)` — disable animations

## Responsive Design

### Breakpoints

- **Desktop**: 1440px+ (3-column: sidebar + main + inspector)
- **Tablet**: 768px–1024px (2-column: collapsed sidebar + main)
- **Mobile**: <480px (1-column: top nav drawer or bottom nav)

### Sidebar Behavior

- **Desktop**: 260px wide, fixed left
- **Collapsed**: 80px wide (icons only, tooltips on hover)
- **Mobile**: 100% width, collapsible drawer or bottom sheet

### Inspector Panel Behavior

- **Desktop**: 560px fixed on right
- **Tablet/Mobile**: Full-width modal overlay

### Overview Cards

- **Desktop**: 4 columns
- **Tablet**: 2 columns
- **Mobile**: 1 column (stack vertically)

## Code Patterns

### Using CSS Modules

All components use CSS Modules for scoped styling:

```tsx
import styles from './MyComponent.module.scss';

export const MyComponent = () => <div className={styles.container}>{/* Content */}</div>;
```

### Referencing Theme Variables

In SCSS files, always use `var(--*)`:

```scss
.myCard {
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
}
```

### Dark Mode Support

The theme.css file includes light mode fallbacks via `@media (prefers-color-scheme: light)`. Components automatically adapt without additional code.

## Common Patterns

### Hover Lift Effect

```scss
transition: all var(--transition-base);

&:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-2);
}

&:active {
  transform: translateY(0);
}
```

### Focus Visible Ring

```scss
&:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### Glass Card

```scss
background: var(--glass-bg);
backdrop-filter: blur(8px);
border: 1px solid var(--border-1);
```

### Badge Status

```scss
padding: 4px 8px;
border-radius: var(--radius-pill);
font-size: var(--type-small);
font-weight: var(--type-weight-semibold);
background: rgba(color, 0.1);
border: 1px solid rgba(color, 0.2);
```

## Screenshot Comparison Checklist

Use this checklist when comparing implementations to the Behance inspiration:

- [ ] Sidebar is dark and positioned on the left with vertical nav
- [ ] Sidebar collapse button works and icons-only state is clear
- [ ] Header has centered search, notifications bell, language button, user avatar
- [ ] Header has glass background with blur effect
- [ ] Overview cards show 4 KPIs with icon, value, delta badge
- [ ] Overview cards have hover lift effect (translateY -6px)
- [ ] Review list shows vertically stacked case cards with avatar/thumbnail
- [ ] Case cards display name, method, risk meter, and review button
- [ ] Inspector panel slides in from right (desktop) or shows as modal (mobile)
- [ ] Inspector panel has tabs (Details, Documents, Timeline, XAI, Audit)
- [ ] Risk meter displays circular progress with percentage
- [ ] XAI trace shows color-coded horizontal bars with weights
- [ ] Buttons have proper hover and focus states
- [ ] All text meets 4.5:1 contrast ratio (run `npm run theme:check`)
- [ ] Responsive layout works at 320px, 768px, 1024px, 1440px
- [ ] Keyboard navigation works (Tab moves focus, Enter activates)
- [ ] Reduced motion preference is respected

## Implementation Workflow

1. **Create component structure**: TSX file + `.module.scss` file
2. **Define semantic HTML**: Use proper roles, ARIA labels
3. **Add base styles**: Use `--*` variables from theme.css
4. **Implement hover/focus states**: Use patterns above
5. **Add responsive rules**: Test at key breakpoints
6. **Test accessibility**: Keyboard nav, color contrast, ARIA
7. **Add comments**: Document complex styles or logic

## References

- Theme tokens: `styles/theme.css`
- Global styles: `styles/globals.scss`
- Component examples: `components/Layout/Sidebar.tsx`, `components/OverviewCards.tsx`
- Testing: `__tests__/components/`
- Heroicons: https://heroicons.com/
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
