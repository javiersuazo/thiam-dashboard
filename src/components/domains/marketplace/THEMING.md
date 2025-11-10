# Marketplace Theme Customization Guide

## Overview

The marketplace domain is **fully themeable** through the application's CSS variable system defined in `src/app/globals.css`. All colors, shadows, spacing, and typography can be customized without touching component code.

## 🎨 Current Theme Integration

### ✅ Components Use Theme Variables

All marketplace components use semantic color tokens from the global theme:

```tsx
// ✅ GOOD - Uses theme variables
<Card className="bg-card text-card-foreground border">
  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Add to Cart
  </Button>
</Card>

// ❌ BAD - Hardcoded colors
<div className="bg-blue-500 text-white">
  <button className="bg-green-600">Add</button>
</div>
```

## 🎯 Theme Token Usage in Marketplace

### Brand Colors (Primary Actions)

Used for primary buttons, links, and interactive elements:

```css
--color-brand-500: #465fff  /* Primary brand color */
--color-brand-600: #3641f5  /* Hover state */
--color-brand-700: #2a31d8  /* Active state */
```

**Marketplace Usage:**
- "Add to Cart" button
- Selected filter chips
- Primary CTA buttons
- Active navigation states
- Progress indicators

### Gray Scale (Neutrals)

Used for backgrounds, borders, text:

```css
--color-gray-50: #f9fafb   /* Light backgrounds */
--color-gray-200: #e4e7ec  /* Borders */
--color-gray-500: #667085  /* Secondary text */
--color-gray-700: #344054  /* Primary text */
--color-gray-900: #101828  /* Headings */
```

**Marketplace Usage:**
- Page background (`bg-gray-50`)
- Card borders
- Input borders
- Secondary text
- Product descriptions

### Success Colors

Used for positive feedback and availability:

```css
--color-success-500: #12b76a
--color-success-600: #039855
```

**Marketplace Usage:**
- "Available" product badges
- Order confirmation
- Success messages
- In-stock indicators

### Error/Warning Colors

Used for unavailable items and validation:

```css
--color-error-500: #f04438    /* Errors */
--color-warning-500: #f79009  /* Warnings */
```

**Marketplace Usage:**
- "Unavailable" product badges
- Form validation errors
- Limited stock warnings
- Delete confirmations

### Semantic Tokens (shadcn/ui)

The shadcn/ui components use semantic tokens that map to theme colors:

```css
/* These are derived from the theme colors above */
background: var(--background)
foreground: var(--foreground)
card: var(--card)
card-foreground: var(--card-foreground)
primary: var(--primary)
primary-foreground: var(--primary-foreground)
secondary: var(--secondary)
destructive: var(--destructive)
border: var(--border)
ring: var(--ring)
```

## 🔧 Customization Methods

### Method 1: Modify Global Theme (Recommended)

Edit `src/app/globals.css` to change the entire application theme:

```css
@theme {
  /* Change primary brand color */
  --color-brand-500: #ff6b35;  /* Orange */
  --color-brand-600: #ff5722;
  --color-brand-700: #e64a19;

  /* Change success color */
  --color-success-500: #4caf50;

  /* Change gray scale for different feel */
  --color-gray-50: #fafafa;
  --color-gray-900: #212121;
}
```

**Result:** Entire app (including marketplace) updates automatically.

### Method 2: Marketplace-Specific Theme Override

Create a theme wrapper for marketplace-only customization:

```tsx
// marketplace-demo/page.tsx or layout
<div className="marketplace-theme">
  <MarketplacePage />
</div>
```

```css
/* globals.css */
.marketplace-theme {
  /* Override brand colors for marketplace only */
  --color-brand-500: #10b981;  /* Emerald green */
  --color-brand-600: #059669;

  /* Custom marketplace shadows */
  --shadow-theme-lg: 0px 20px 40px rgba(0, 0, 0, 0.15);
}
```

### Method 3: CSS Variable Injection (Dynamic Theming)

For runtime theme switching:

```tsx
// ThemeProvider.tsx
export function MarketplaceThemeProvider({
  children,
  brandColor = '#465fff'
}: {
  children: React.ReactNode
  brandColor?: string
}) {
  return (
    <div style={{
      '--color-brand-500': brandColor,
      '--color-brand-600': shadeColor(brandColor, -10),
      '--color-brand-700': shadeColor(brandColor, -20),
    } as React.CSSProperties}>
      {children}
    </div>
  )
}
```

## 🎨 Complete Marketplace Color Map

### Current Color Usage

| Element | Token | CSS Variable | Current Value |
|---------|-------|--------------|---------------|
| **Backgrounds** ||||
| Page background | `bg-gray-50` | `--color-gray-50` | #f9fafb |
| Card background | `bg-white` | `--color-white` | #ffffff |
| Product card hover | - | - | Shadow elevation |
| **Text** ||||
| Headings | `text-gray-900` | `--color-gray-900` | #101828 |
| Body text | `text-gray-700` | `--color-gray-700` | #344054 |
| Secondary text | `text-gray-500` | `--color-gray-500` | #667085 |
| Muted text | `text-gray-400` | `--color-gray-400` | #98a2b3 |
| **Buttons** ||||
| Primary button | `bg-primary` | `--color-brand-500` | #465fff |
| Primary hover | `hover:bg-primary/90` | `--color-brand-600` | #3641f5 |
| Outline button | `bg-background` | - | Transparent |
| Destructive | `bg-destructive` | `--color-error-500` | #f04438 |
| **Borders** ||||
| Default border | `border` | `--color-gray-200` | #e4e7ec |
| Input border | `border-input` | `--color-gray-300` | #d0d5dd |
| Focus ring | `ring-ring` | `--color-brand-400` | #7592ff |
| **Badges** ||||
| Available | `bg-success-100` | `--color-success-100` | #d1fadf |
| Unavailable | `bg-destructive` | `--color-error-500` | #f04438 |
| Limited | `bg-secondary` | `--color-gray-200` | #e4e7ec |
| Category | `bg-gray-100` | `--color-gray-100` | #f2f4f7 |
| **Interactive** ||||
| Filter active | `bg-brand-50` | `--color-brand-50` | #ecf3ff |
| Hover state | `hover:bg-accent` | - | Gray-based |
| Selected item | `bg-brand-100` | `--color-brand-100` | #dde9ff |

## 📐 Spacing & Layout Tokens

The app uses an 8px base grid system:

```css
/* Spacing scale (all multiples of 8px) */
--spacing-1: 4px   /* 0.5 × 8 */
--spacing-2: 8px   /* 1 × 8 */
--spacing-3: 12px  /* 1.5 × 8 */
--spacing-4: 16px  /* 2 × 8 */
--spacing-6: 24px  /* 3 × 8 */
--spacing-8: 32px  /* 4 × 8 */
--spacing-12: 48px /* 6 × 8 */
```

**Marketplace Usage:**
- Page gutters: `px-4` (16px) on mobile, `px-6` (24px) on desktop
- Card padding: `p-4` (16px) for content, `p-6` (24px) for larger cards
- Section spacing: `gap-6` (24px) between major regions
- Component spacing: `space-y-2` (8px) for tight, `space-y-4` (16px) for comfortable

## 🔤 Typography Tokens

```css
/* Text sizes */
--text-theme-xs: 12px   /* Captions, hints */
--text-theme-sm: 14px   /* Body, labels */
--text-base: 16px       /* Default body */
--text-theme-xl: 20px   /* Section headers */
--text-title-sm: 30px   /* Page titles */

/* Font weights */
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
```

**Marketplace Usage:**
- Product names: `text-lg font-semibold` (18px, 600)
- Product descriptions: `text-sm text-gray-600` (14px, 400)
- Section headers: `text-xl font-semibold` (20px, 600)
- Form labels: `text-sm font-medium` (14px, 500)
- Hints: `text-xs text-gray-500` (12px, 400)

## 🌑 Dark Mode Support

All marketplace components support dark mode through CSS variable overrides:

```css
/* Automatic dark mode variants */
.dark {
  --color-gray-50: #0c111d;
  --color-gray-900: #fcfcfd;
  /* Backgrounds and text colors invert */
}
```

**Marketplace Dark Mode:**
- Background: `bg-gray-50 dark:bg-gray-950`
- Cards: `bg-white dark:bg-gray-900`
- Text: `text-gray-900 dark:text-gray-50`
- Borders: `border-gray-200 dark:border-gray-800`

All components automatically adapt when `dark` class is added to root.

## 🎭 Shadow Tokens

```css
--shadow-theme-xs: 0px 1px 2px rgba(16, 24, 40, 0.05)
--shadow-theme-sm: 0px 1px 3px rgba(16, 24, 40, 0.1)
--shadow-theme-md: 0px 4px 8px -2px rgba(16, 24, 40, 0.1)
--shadow-theme-lg: 0px 12px 16px -4px rgba(16, 24, 40, 0.08)
--shadow-theme-xl: 0px 20px 24px -4px rgba(16, 24, 40, 0.08)
```

**Marketplace Usage:**
- Product cards: `shadow-sm hover:shadow-lg` transition
- Sticky header: `shadow-sm`
- Dropdown menus: `shadow-lg`
- Modals: `shadow-xl`

## 🔧 Custom Theme Examples

### Example 1: Green/Eco Theme

```css
@theme {
  --color-brand-500: #10b981;  /* Emerald */
  --color-brand-600: #059669;
  --color-brand-700: #047857;

  --color-success-500: #22c55e;  /* Green */
}
```

### Example 2: Purple/Premium Theme

```css
@theme {
  --color-brand-500: #8b5cf6;  /* Violet */
  --color-brand-600: #7c3aed;
  --color-brand-700: #6d28d9;

  --color-gray-50: #faf9fb;    /* Slightly purple tint */
}
```

### Example 3: Orange/Food Theme

```css
@theme {
  --color-brand-500: #fb6514;  /* Orange (already defined) */
  --color-brand-600: #ec4a0a;
  --color-brand-700: #c4320a;

  --color-success-500: #f59e0b;  /* Amber for "available" */
}
```

### Example 4: Dark Professional Theme

```css
@theme {
  --color-brand-500: #60a5fa;  /* Light blue for dark bg */
  --color-gray-50: #111827;    /* Dark background */
  --color-gray-900: #f9fafb;   /* Light text */
}
```

## 📝 Theme Configuration File (Recommended)

Create a centralized theme config:

```typescript
// src/config/marketplace-theme.ts
export const marketplaceTheme = {
  colors: {
    primary: {
      DEFAULT: 'var(--color-brand-500)',
      hover: 'var(--color-brand-600)',
      active: 'var(--color-brand-700)',
    },
    success: 'var(--color-success-500)',
    error: 'var(--color-error-500)',
    warning: 'var(--color-warning-500)',
  },
  spacing: {
    card: '1.5rem',      // 24px
    section: '2rem',     // 32px
    page: '1rem',        // 16px (mobile), 1.5rem (desktop)
  },
  shadows: {
    card: 'var(--shadow-theme-sm)',
    cardHover: 'var(--shadow-theme-lg)',
    header: 'var(--shadow-theme-xs)',
  },
  borderRadius: {
    card: '0.75rem',     // 12px
    button: '0.5rem',    // 8px
    badge: '9999px',     // Full round
  },
}
```

## 🚀 Dynamic Theme Switching

For runtime theme switching (e.g., user preferences):

```typescript
// useTheme.ts
import { useEffect } from 'react'

export function useTheme(theme: 'light' | 'dark' | 'auto') {
  useEffect(() => {
    const root = document.documentElement

    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // Auto: match system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', isDark)
    }
  }, [theme])
}
```

## 🎨 Brand Color Customization UI

For end-user brand customization:

```tsx
// BrandColorPicker.tsx
export function BrandColorPicker() {
  const [brandColor, setBrandColor] = useState('#465fff')

  useEffect(() => {
    document.documentElement.style.setProperty('--color-brand-500', brandColor)
    // Calculate hover/active variants
    document.documentElement.style.setProperty('--color-brand-600', darken(brandColor, 10))
    document.documentElement.style.setProperty('--color-brand-700', darken(brandColor, 20))
  }, [brandColor])

  return (
    <input
      type="color"
      value={brandColor}
      onChange={(e) => setBrandColor(e.target.value)}
    />
  )
}
```

## ✅ Theme Checklist

When customizing the marketplace theme:

- [x] All colors use CSS variables (no hardcoded hex values)
- [x] Components support dark mode
- [x] Spacing follows 8px grid system
- [x] Typography uses semantic tokens
- [x] Shadows are consistent across components
- [x] Border radii are consistent
- [x] Focus states are visible
- [x] Hover states provide feedback
- [x] Color contrast meets WCAG AA
- [x] Theme can be changed without code changes

## 📚 Resources

- **Theme Tokens**: `src/app/globals.css` (lines 6-164)
- **Component Library**: `src/components/shared/ui/`
- **Marketplace Components**: `src/components/domains/marketplace/components/`
- **shadcn/ui Docs**: https://ui.shadcn.com/themes

## 🎯 Summary

The marketplace domain is **100% themeable** through:

✅ **CSS Variables** - All colors, shadows, spacing defined in one place
✅ **Semantic Tokens** - Components use meaningful names, not literal colors
✅ **Dark Mode Ready** - Automatic dark mode support
✅ **No Hardcoded Values** - All styling uses theme tokens
✅ **Runtime Customization** - Theme can be changed dynamically
✅ **Brand Flexibility** - Easy to match any brand identity

**To customize:** Simply update CSS variables in `globals.css` or inject them dynamically at runtime. No component code changes needed.
