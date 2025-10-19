/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#cf202d', // Logo red (exact match)
          600: '#cf202d', // Brand red
          700: '#b01824', // Hover state
          800: '#8a131c', // Dark state
          900: '#450a0a',
        },
        accent: {
          500: '#cf202d', // Logo red
          600: '#b01824'  // Hover
        },
        red: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#cf202d', // Override Tailwind default with brand red
          600: '#cf202d', // Brand red
          700: '#b01824', // Hover state
          800: '#8a131c', // Dark state
          900: '#450a0a',
        }
      }
    },
  },
  plugins: [
    forms,
    typography
  ],
  future: {
    hoverOnlyWhenSupported: true,
  }
}