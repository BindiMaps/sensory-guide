# Design System v5 - Sensory Guide

> **Status:** APPROVED
> **Decision Date:** 2026-01-28
> **Reference Implementation:** `ux-design-direction-v5.html`
> **Screenshots:** `screenshots/v5-chosen.png`

---

## Decision Summary

After evaluating 6+ design variations, **v5** was selected as the final design direction for the Sensory Guide public interface. This document captures all design tokens, component patterns, and accessibility requirements that MUST be followed during implementation.

### Why v5?

| Criteria | Decision |
|----------|----------|
| Typography | Inter - highly legible, professional, wide language support |
| Accessibility | Full WCAG 2.1 AA compliance built-in (focus states, ARIA, keyboard nav) |
| Aesthetic | Warm, calming, institutional - not clinical or cold |
| Colour System | Terracotta accent + semantic sensory colours with verified contrast |
| Maintainability | CSS custom properties, no complex theming |

---

## Design Tokens

### Colours

```css
/* Core Palette */
--background: #FFFFFF;
--surface: #F8F8F6;
--surface-hover: #F2F2EF;
--text: #1A1A1A;
--text-secondary: #3D3D3D;
--text-muted: #595959;        /* 7:1 contrast on white */
--border: #DDDDD9;
--border-light: #E8E8E5;

/* Accent - Warm Terracotta */
--accent: #B8510D;            /* Primary actions, expanded states */
--accent-hover: #9A4409;
--accent-light: #FEF7F2;      /* Subtle backgrounds */

/* Sensory Levels (WCAG AA verified) */
--sensory-low: #2A6339;       /* Green - calm */
--sensory-medium: #8A5F08;    /* Amber - moderate */
--sensory-high: #9E3322;      /* Red - intense */
```

### Typography

```css
/* Font Stack */
--font: "Inter", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;

/* Scale */
--text-xs: 0.6875rem;    /* 11px - badges, labels */
--text-sm: 0.75rem;      /* 12px - meta text */
--text-base: 0.875rem;   /* 14px - body, category text */
--text-md: 0.9375rem;    /* 15px - intro text */
--text-lg: 1rem;         /* 16px - section titles */
--text-xl: 1.625rem;     /* 26px - venue name */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.2;
--leading-snug: 1.35;
--leading-normal: 1.55;
--leading-relaxed: 1.6;
```

### Spacing

```css
--space-1: 0.1875rem;   /* 3px */
--space-2: 0.375rem;    /* 6px */
--space-3: 0.5rem;      /* 8px */
--space-4: 0.75rem;     /* 12px */
--space-5: 1rem;        /* 16px */
--space-6: 1.25rem;     /* 20px */
--space-8: 1.5rem;      /* 24px */
--space-10: 2rem;       /* 32px */
--space-12: 2.5rem;     /* 40px */
--space-16: 4rem;       /* 64px */
```

### Borders & Radii

```css
--radius: 4px;          /* Standard radius */
--radius-sm: 2px;       /* Badges, small elements */
--border-width: 1px;
--border-width-focus: 2px;
```

---

## Badge Colours (Sensory Categories)

All badges verified for 4.5:1+ contrast ratio:

| Category | Background | Text | Use For |
|----------|------------|------|---------|
| Sound | `#E3ECF0` | `#264854` | Noise, announcements, echoes |
| Light | `#F4EBDA` | `#4D3F14` | Brightness, screens, flickering |
| Crowds | `#EDE6E0` | `#3F352C` | Density, queues, busy periods |
| Smells | `#E6EEE7` | `#263D29` | Food, cleaning products, air fresheners |

---

## Component Inventory

### 1. Expandable Section (Primary Pattern)

```
┌─────────────────────────────────────────────────────┐
│ ○  Section Title                          ■ Medium │
│    [SOUND] [LIGHT] [CROWDS]                        │
├─────────────────────────────────────────────────────┤
│    Category Title                                   │
│    Description text with helpful details...         │
└─────────────────────────────────────────────────────┘
```

**Requirements:**
- `<button>` element for header (NOT div with onclick)
- `aria-expanded="true/false"` on button AND parent article
- `aria-controls` pointing to content ID
- 28px minimum toggle touch target
- Focus-visible ring on keyboard navigation
- Hover state extends into padding (visual feedback)

### 2. Intro Card

```
┌─────────────────────────────────────────────────────┐
│▌ About this guide                                   │
│▌ Description text explaining the guide purpose...   │
└─────────────────────────────────────────────────────┘
```

**Requirements:**
- Left border accent (3px, `--accent`)
- Surface background (`--surface`)
- No interactive elements

### 3. Sensory Level Indicator

```
■ Low     ■ Medium     ■ High
```

**Requirements:**
- 12x12px square indicator
- Text label uses same colour as indicator
- Never use colour alone - always paired with text

### 4. Header

```
SENSORY GUIDE          [Download PDF] [Print]
```

**Requirements:**
- Sticky positioning
- Minimal height
- Actions as buttons with visible borders

### 5. Sensory Key (Footer)

```
┌─────────────────────────────────────────────────────┐
│ SENSORY LEVEL KEY                                   │
│ ■ Low — Generally calm                              │
│ ■ Medium — Some activity                            │
│ ■ High — May be overwhelming                        │
└─────────────────────────────────────────────────────┘
```

---

## Accessibility Requirements (MANDATORY)

### Keyboard Navigation
- All sections expandable via Enter/Space
- Tab order follows visual order
- Focus visible on all interactive elements

### Screen Readers
- Skip link to main content
- `aria-expanded` states on sections
- `aria-label` on badge containers
- `aria-hidden="true"` on decorative indicators

### Motion & Contrast
- `prefers-reduced-motion` disables transitions
- `prefers-contrast: high` increases border visibility
- All text meets 4.5:1 minimum contrast

### Touch Targets
- Minimum 28px for toggle buttons
- Full-width tap area on section headers

---

## Responsive Breakpoints

| Breakpoint | Width | Changes |
|------------|-------|---------|
| Mobile | ≤640px | Venue name smaller, stacked key items, adjusted padding |
| Desktop | >640px | Full layout |

---

## Print Styles

When `@media print`:
- Hide header, skip link
- Expand all sections automatically
- Remove toggle indicators
- Full width, minimal padding

---

## File References

| File | Purpose |
|------|---------|
| `ux-design-direction-v5.html` | Reference implementation |
| `screenshots/v5-chosen.png` | Visual reference |
| `ux-design-direction-v3.html` | Earlier iteration (v5 base) |
| `ux-design-direction-v2-variations.html` | Rejected variations |

---

## Tailwind Implementation Notes

When implementing in Tailwind v4:

```js
// tailwind.config.js extension for public UI
theme: {
  extend: {
    colors: {
      accent: {
        DEFAULT: '#B8510D',
        hover: '#9A4409',
        light: '#FEF7F2',
      },
      sensory: {
        low: '#2A6339',
        medium: '#8A5F08',
        high: '#9E3322',
      },
      badge: {
        sound: { bg: '#E3ECF0', text: '#264854' },
        light: { bg: '#F4EBDA', text: '#4D3F14' },
        crowds: { bg: '#EDE6E0', text: '#3F352C' },
        smells: { bg: '#E6EEE7', text: '#263D29' },
      },
    },
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
    },
  },
}
```

---

_This document is the source of truth for Sensory Guide public UI styling. All implementation must conform to these specifications._
