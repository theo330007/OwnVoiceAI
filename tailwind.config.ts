import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#556B2F',
          50: '#F5F7F0',
          100: '#E8EDD9',
          200: '#D1DEB3',
          300: '#BACF8D',
          400: '#A3C067',
          500: '#556B2F',
          600: '#445625',
          700: '#33411C',
          800: '#222B13',
          900: '#11160A',
        },
        cream: {
          DEFAULT: '#FAF9F6',
          50: '#FFFFFF',
          100: '#FAF9F6',
        },
        'dusty-rose': {
          DEFAULT: '#D4A373',
          50: '#F9F3ED',
          100: '#F3E7DB',
          200: '#E7CFB7',
          300: '#DBB793',
          400: '#D4A373',
          500: '#C08959',
          600: '#9D6E47',
          700: '#755236',
          800: '#4D3724',
          900: '#251B12',
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(85, 107, 47, 0.1)',
        'soft-lg': '0 4px 25px -5px rgba(85, 107, 47, 0.15)',
      },
    },
  },
  plugins: [],
} satisfies Config;
