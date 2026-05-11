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
        // Hugging Face yellow (HF brand).
        brand: {
          50: '#fffbeb',
          100: '#fff3c4',
          200: '#ffe88a',
          300: '#ffd84d',
          400: '#ffd21e',
          500: '#f5b800',
          600: '#cc9700',
          700: '#a37700',
          800: '#7a5900',
          900: '#5c4300',
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
