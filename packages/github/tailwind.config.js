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
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b8d6ff',
          300: '#8bbaff',
          400: '#5996ff',
          500: '#3674f0',
          600: '#2557d3',
          700: '#1f47a8',
          800: '#1d3d85',
          900: '#1c356a',
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
