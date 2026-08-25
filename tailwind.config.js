/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F5F0',
        surface: '#FFFFFF',
        ink: '#17181C',
        muted: '#6B6A63',
        line: '#E3DFD6',
        accent: '#1F4FD8',
        'accent-dark': '#17359C',
      },
      fontFamily: {
        sans: [
          'Coming Soon',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: ['Gloria Hallelujah', 'cursive'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, 6px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
      },
    },
  },
  plugins: [],
};
