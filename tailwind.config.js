/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#05070C',
        surface: '#0B0E16',
        ink: '#F1F3F9',
        accent: '#5B7FFF',
        accent2: '#22D3EE',
        panel: 'rgba(255,255,255,0.04)',
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
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, 6px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 4px rgba(91,127,255,0.15)' },
          '50%': { boxShadow: '0 0 0 8px rgba(91,127,255,0.08)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30px, -20px) scale(1.08)' },
        },
        floatSlower: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-25px, 25px) scale(1.05)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
        glowPulse: 'glowPulse 2.4s ease-in-out infinite',
        'float-slow': 'floatSlow 14s ease-in-out infinite',
        'float-slower': 'floatSlower 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
