/**
 * Centralized Theme Configuration
 * Change colors, spacing, and design tokens here to update the entire app
 */

export const theme = {
  // Brand Colors
  colors: {
    // Primary brand color (used for main actions, CTAs)
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Main primary
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
    },

    // Secondary accent color
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Main secondary
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },

    // Success/Savings color (green)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    // Warning/Alert color (orange/amber)
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    // Danger/Cancel color (red)
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main danger
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Neutral/Gray scale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },

  // Semantic color mappings (easier to change theme)
  semanticColors: {
    // Recommendation types
    downgrade: {
      bg: '#eff6ff',       // blue-50
      border: '#bfdbfe',   // blue-200
      text: '#1e40af',     // blue-800
      icon: '#2563eb',     // blue-600
    },
    cancel: {
      bg: '#fef2f2',       // red-50
      border: '#fecaca',   // red-200
      text: '#991b1b',     // red-800
      icon: '#dc2626',     // red-600
    },
    bundle: {
      bg: '#faf5ff',       // purple-50
      border: '#e9d5ff',   // purple-200
      text: '#6b21a8',     // purple-800
      icon: '#9333ea',     // purple-600
    },
    overlap: {
      bg: '#fffbeb',       // amber-50
      border: '#fde68a',   // amber-200
      text: '#92400e',     // amber-800
      icon: '#d97706',     // amber-600
    },

    // UI States
    background: '#f9fafb',      // gray-50
    surface: '#ffffff',         // white
    surfaceHover: '#f3f4f6',   // gray-100
    border: '#e5e7eb',         // gray-200
    borderHover: '#d1d5db',    // gray-300
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, sans-serif',
      mono: 'Monaco, Courier New, monospace',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // Spacing (for consistent padding/margins)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',  // Circle
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
} as const

/**
 * Helper function to get color values
 */
export function getColor(path: string): string {
  const parts = path.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = theme.colors

  for (const part of parts) {
    // eslint-disable-next-line security/detect-object-injection
    value = value[part]
    if (!value) return '#000000' // Fallback
  }

  return value
}

/**
 * Tailwind class generators (for dynamic classes)
 */
export const tw = {
  // Primary button classes
  buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors',

  // Secondary button classes
  buttonSecondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium rounded-xl transition-colors',

  // Success button classes
  buttonSuccess: 'bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors',

  // Danger button classes
  buttonDanger: 'bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors',

  // Card classes
  card: 'bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow',

  // Input classes
  input: 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all',

  // Badge classes
  badge: 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
  badgeSuccess: 'bg-green-100 text-green-800',
  badgeWarning: 'bg-amber-100 text-amber-800',
  badgeDanger: 'bg-red-100 text-red-800',
  badgeInfo: 'bg-blue-100 text-blue-800',
}

/**
 * Export utility to convert theme to CSS variables
 * Can be used in global CSS or _app.tsx
 */
export function generateCSSVariables(): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary[500],
    '--color-secondary': theme.colors.secondary[500],
    '--color-success': theme.colors.success[500],
    '--color-warning': theme.colors.warning[500],
    '--color-danger': theme.colors.danger[500],
    '--color-background': theme.semanticColors.background,
    '--color-surface': theme.semanticColors.surface,
    '--color-border': theme.semanticColors.border,
    '--radius-sm': theme.borderRadius.sm,
    '--radius-md': theme.borderRadius.md,
    '--radius-lg': theme.borderRadius.lg,
    '--radius-xl': theme.borderRadius.xl,
    '--radius-2xl': theme.borderRadius['2xl'],
    '--transition-fast': theme.transitions.fast,
    '--transition-normal': theme.transitions.normal,
    '--transition-slow': theme.transitions.slow,
  }
}
