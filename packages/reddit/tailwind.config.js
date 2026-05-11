/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,ts,svelte}',
    '../core/src/**/*.{html,ts,svelte}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f0',
          100: '#ffe7d6',
          200: '#ffc8a3',
          300: '#ffa46a',
          400: '#ff8035',
          500: '#ff5700',
          600: '#e64e00',
          700: '#bf4100',
          800: '#993300',
          900: '#7a2900',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
