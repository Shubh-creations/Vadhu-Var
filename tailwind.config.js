/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', '"Noto Serif Devanagari"', 'Georgia', 'serif'],
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'serif'],
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        gold: {
          300: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          champagne: '#D4AF37',
        },
        crimson: {
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
          dark: '#1a0b0e',
        },
        obsidian: {
          800: '#14151b',
          900: '#0c0d12',
          950: '#040405',
          card: '#09090b',
          surface: '#0d0d11',
        },
        skyBlue: {
          500: '#38bdf8',
          600: '#0284c7',
          700: '#0369a1',
        },
        lightGreen: {
          400: '#4ade80',
          500: '#22c55e',
          700: '#15803d',
        }
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
      }
    },
  },
  plugins: [],
}
