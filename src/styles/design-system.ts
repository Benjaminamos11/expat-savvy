/**
 * EXPAT-SAVVY DESIGN SYSTEM
 * Central configuration for all design decisions
 * Import this file whenever building components
 */

export const DesignSystem = {
  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Primary Brand Colors (from logo: #cf202d)
    primary: {
      main: '#cf202d',      // Brand Red (exact match from logo)
      hover: '#b01824',     // Darker red for hover states
      light: '#e63946',     // Light red
      flow: '#C41E3A',      // Red Flow specific red
      highlight: '#F5E6E8', // Red Flow highlight background
      50: '#ffebee',
      100: '#ffcdd2',
      600: '#cf202d',       // Standard Tailwind naming
      700: '#b01824',       // Hover state
      800: '#8a131c',       // Dark state
    },

    // Neutrals
    white: '#ffffff',
    black: '#000000',

    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // Semantic Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, sans-serif',
    },

    // Heading Sizes
    heading: {
      h1: {
        mobile: 'text-4xl font-extrabold',
        desktop: 'md:text-6xl font-extrabold',
        full: 'text-4xl md:text-6xl font-extrabold',
      },
      h2: {
        mobile: 'text-3xl font-extrabold',
        desktop: 'md:text-5xl font-extrabold',
        full: 'text-3xl md:text-5xl font-extrabold',
      },
      h3: {
        mobile: 'text-2xl font-bold',
        desktop: 'md:text-3xl font-bold',
        full: 'text-2xl md:text-3xl font-bold',
      },
      h4: {
        mobile: 'text-xl font-semibold',
        desktop: 'md:text-2xl font-semibold',
        full: 'text-xl md:text-2xl font-semibold',
      },
    },

    // Body Text
    body: {
      large: 'text-lg md:text-xl',
      base: 'text-base md:text-lg',
      small: 'text-sm md:text-base',
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    section: {
      padding: 'py-16 md:py-24',
      small: 'py-12 md:py-16',
    },
    container: {
      default: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      narrow: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
      wide: 'max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8',
    },
    gap: {
      cards: 'gap-6 md:gap-8',
      sections: 'gap-12 md:gap-16',
    },
  },

  // ============================================
  // COMPONENTS
  // ============================================
  components: {
    // Button Styles
    button: {
      primary: `
        inline-flex items-center justify-center
        px-6 md:px-8 py-3 md:py-4
        bg-red-600 hover:bg-red-700 
        text-white font-medium
        rounded-2xl shadow-lg hover:shadow-xl
        transition-all duration-200
        text-base md:text-lg
      `,
      secondary: `
        inline-flex items-center justify-center
        px-6 md:px-8 py-3 md:py-4
        bg-white hover:bg-gray-50
        border-2 border-red-500
        text-red-700 font-medium
        rounded-2xl shadow-lg hover:shadow-xl
        transition-all duration-200
        text-base md:text-lg
      `,
      ghost: `
        inline-flex items-center justify-center
        px-6 py-3
        text-gray-700 hover:text-gray-900
        font-medium
        rounded-lg hover:bg-gray-100
        transition-all duration-200
      `,
    },

    // Card Styles
    card: {
      default: `
        bg-white rounded-2xl shadow-md
        hover:shadow-xl transition-all duration-300
        border border-gray-100
      `,
      padding: 'p-6 md:p-8',
      noPadding: '',
    },

    // Icon Container
    icon: {
      large: `
        flex items-center justify-center
        h-16 w-16 rounded-full
        bg-red-50 text-red-600
      `,
      medium: `
        flex items-center justify-center
        h-12 w-12 rounded-full
        bg-red-50 text-red-600
      `,
      small: `
        flex items-center justify-center
        h-10 w-10 rounded-full
        bg-red-50 text-red-600
      `,
    },
  },

  // ============================================
  // SECTIONS
  // ============================================
  sections: {
    hero: {
      background: 'bg-gray-900',
      overlay: 'bg-gradient-to-r from-black/50 to-black/30',
      minHeight: 'min-h-[50vh] md:min-h-[90vh]',
    },

    content: {
      white: 'bg-white',
      gray: 'bg-gray-50',
      primary: 'bg-red-600',
    },

    cta: {
      background: 'bg-gradient-to-r from-red-600 to-red-800',
      padding: 'py-16 md:py-20',
    },
  },

  // ============================================
  // ANIMATIONS
  // ============================================
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    hover: {
      lift: 'hover:-translate-y-1 transition-transform duration-200',
      scale: 'hover:scale-105 transition-transform duration-200',
    },
  },
};

// Helper function to combine classes
export const cn = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

