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
        serif: ['Lora', 'Noto Serif Devanagari', 'Georgia', 'serif'],
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      colors: {
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
        'card': '8px',
        'btn': '6px',
      }
    },
  },
  plugins: [],
}
