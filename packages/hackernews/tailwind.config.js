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
        // Hacker News / Y Combinator orange.
        brand: {
          50: '#fff5eb',
          100: '#ffe4c4',
          200: '#ffc88a',
          300: '#ffa64d',
          400: '#ff851a',
          500: '#ff6600',
          600: '#e55a00',
          700: '#bf4a00',
          800: '#993b00',
          900: '#7a2f00',
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
