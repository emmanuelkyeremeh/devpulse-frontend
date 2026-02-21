/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        star: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1) translateY(0) translateX(0)' },
          '50%': { opacity: '0.9', transform: 'scale(1.1) translateY(0) translateX(0)' },
        },
        'star-drift': {
          '0%': { transform: 'translateY(100vh) translateX(0) scale(0.6)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-20vh) translateX(0) scale(1)', opacity: '0' },
        },
        'grid-move': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '64px 64px' },
        },
        'grid-move-slow': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-48px -48px' },
        },
      },
      animation: {
        star: 'star 3s ease-in-out infinite',
        'star-drift': 'star-drift 25s linear infinite',
        'grid-move': 'grid-move 8s linear infinite',
        'grid-move-slow': 'grid-move-slow 15s linear infinite',
      },
    },
  },
  plugins: [],
};
