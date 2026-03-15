/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'jp': {
          primary: '#1D4ED8',
          'primary-dark': '#1E3A8A',
          'primary-light': '#DBEAFE',
          accent: '#F59E0B',
          success: '#10B981',
          danger: '#EF4444',
          text: '#0F172A',
          'text-soft': '#475569',
          'text-muted': '#94A3B8',
          bg: '#F0F7FF',
          surface: '#FFFFFF',
          border: '#BFDBFE',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
