/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1728',
          800: '#10233F', // Brand Deep Navy Blue
          700: '#162F54',
          600: '#1E3E6E',
        },
        brand: {
          blue: '#2563EB', // Primary blue
          light: '#EFF6FF', // Light blue background / badge
          dark: '#1D4ED8',
          subtle: '#DBEAFE',
        },
        surface: {
          bg: '#F7F9FC', // Background grey
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F1F5F9',
        },
        ink: {
          primary: '#172033', // Primary text
          secondary: '#64748B', // Secondary text
          muted: '#94A3B8',
        },
        status: {
          success: '#15803D',
          'success-bg': '#DCFCE7',
          warning: '#B45309',
          'warning-bg': '#FEF3C7',
          error: '#B91C1C',
          'error-bg': '#FEE2E2',
          review: '#4338CA',
          'review-bg': '#E0E7FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(16, 35, 63, 0.05), 0 1px 2px -1px rgba(16, 35, 63, 0.05)',
        elevated: '0 4px 6px -1px rgba(16, 35, 63, 0.07), 0 2px 4px -2px rgba(16, 35, 63, 0.07)',
        glow: '0 0 15px rgba(37, 99, 235, 0.15)',
      }
    },
  },
  plugins: [],
}
