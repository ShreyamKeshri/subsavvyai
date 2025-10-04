# SubSavvyAI - Design System

## Overview
This design system is fully configurable. All colors, spacing, and design tokens are centralized in `lib/config/theme.ts`. Change values there to update the entire app.

## Current Theme Configuration

### Color Palette (Changeable in `lib/config/theme.ts`)

**Primary Brand Colors:**
- Primary: Indigo (#6366f1) - Main CTAs, buttons, links
- Secondary: Purple (#a855f7) - Accents, secondary actions
- Success: Green (#22c55e) - Savings, positive actions
- Warning: Orange (#f59e0b) - Alerts, attention needed
- Danger: Red (#ef4444) - Cancellations, destructive actions

**Recommendation Types:**
- Downgrade: Blue (#2563eb)
- Cancel: Red (#dc2626)
- Bundle: Purple (#9333ea)
- Overlap: Amber (#d97706)

### Typography
- Font Family: Inter (sans-serif)
- Sizes: xs (12px) → 5xl (48px)
- Weights: normal (400), medium (500), semibold (600), bold (700)

### Spacing
- xs (4px), sm (8px), md (16px), lg (24px), xl (32px), 2xl (48px), 3xl (64px)

### Border Radius
- sm (4px), md (8px), lg (12px), xl (16px), 2xl (24px)

### Shadows
- sm, md, lg, xl (elevation levels)

## How to Change Theme

### Option 1: Update theme.ts
```typescript
// lib/config/theme.ts
export const theme = {
  colors: {
    primary: {
      500: '#YOUR_COLOR', // Change main primary color
    },
    // ... update other colors
  }
}
```

### Option 2: Update Semantic Colors
```typescript
// lib/config/theme.ts
semanticColors: {
  downgrade: {
    bg: '#YOUR_BG_COLOR',
    border: '#YOUR_BORDER_COLOR',
    text: '#YOUR_TEXT_COLOR',
    icon: '#YOUR_ICON_COLOR',
  }
}
```

## Using Theme in Components

### Method 1: Import theme object
```typescript
import { theme } from '@/lib/config/theme'

<div style={{ color: theme.colors.primary[500] }}>
  Primary colored text
</div>
```

### Method 2: Use tw utility classes
```typescript
import { tw } from '@/lib/config/theme'

<Button className={tw.buttonPrimary}>
  Click me
</Button>
```

### Method 3: Use getColor helper
```typescript
import { getColor } from '@/lib/config/theme'

const primaryColor = getColor('primary.500')
```

## Design Principles

1. **Consistency**: Use theme values everywhere, never hardcode colors
2. **Flexibility**: Easy to switch themes/colors by changing one file
3. **Scalability**: Add new color schemes without touching components
4. **Accessibility**: Maintain color contrast ratios when changing colors

## Component Guidelines

### Buttons
- Primary actions: `tw.buttonPrimary` (indigo)
- Secondary actions: `tw.buttonSecondary` (outline)
- Success actions: `tw.buttonSuccess` (green)
- Destructive actions: `tw.buttonDanger` (red)

### Cards
- Default: `tw.card` (white with shadow)
- Hover: Auto shadow increase
- Border radius: Always use `rounded-xl` or `rounded-2xl`

### Typography
- Headings: Bold, large (2xl-3xl)
- Body: Regular, readable (sm-base)
- Numbers/Stats: Very large (4xl-5xl), bold

### Spacing
- Card padding: p-4 to p-6
- Section margins: mb-6 to mb-8
- Grid gaps: gap-4 to gap-6

## Recommendation-Specific Styles

Each recommendation type has its own color scheme defined in `theme.semanticColors`:

```typescript
// Downgrade recommendation
className="bg-blue-50 border-blue-200"

// Cancel recommendation
className="bg-red-50 border-red-200"

// Bundle recommendation
className="bg-purple-50 border-purple-200"
```

## Future Theme Options

To add dark mode or alternate themes:

1. Create new theme object:
```typescript
export const darkTheme = {
  colors: { /* dark colors */ }
}
```

2. Add theme switcher context
3. Swap theme objects based on user preference

## V0 Design Guidelines

When using Vercel V0 for designs:
- **Don't specify exact hex colors** - use color names (primary, success, warning)
- Request "configurable theme" or "use theme variables"
- Focus on layout, spacing, component structure
- Colors will be applied from our theme config

## Quick Reference

**Changing Primary Color:** `theme.colors.primary[500]`
**Changing Success Color:** `theme.colors.success[500]`
**Changing Card Radius:** `theme.borderRadius.xl`
**Changing Button Style:** `tw.buttonPrimary`

All changes propagate automatically across the app! 🎨
