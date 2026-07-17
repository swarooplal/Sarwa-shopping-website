import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F3D2E',
          50: '#F1F6F2',
          100: '#DDE7DF',
          200: '#B7CABB',
          300: '#90AD97',
          400: '#5C7E66',
          500: '#1F3D2E',
          600: '#1A3326',
          700: '#152A1F',
          800: '#102118',
          900: '#0A1810',
        },
        ivory: {
          DEFAULT: '#FBF7F0',
          50: '#FBF7F0',
          100: '#F4ECDF',
          200: '#E8DCC0',
        },
        champagne: {
          DEFAULT: '#C9A96E',
          50: '#FBF6EB',
          100: '#F2E7C8',
          200: '#E6D29B',
          300: '#D4B97D',
          400: '#C9A96E',
          500: '#B98E51',
          600: '#9B7438',
        },
        charcoal: {
          DEFAULT: '#2C2C2C',
          50: '#F5F5F5',
          100: '#E4E4E4',
          200: '#C7C7C7',
          300: '#9E9E9E',
          400: '#5C5C5C',
          500: '#3A3A3A',
          600: '#2C2C2C',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 24px 48px -16px rgba(31, 61, 46, 0.18)',
        soft: '0 10px 30px -12px rgba(0, 0, 0, 0.10)',
        gold: '0 18px 36px -16px rgba(201, 169, 110, 0.45)',
      },
      letterSpacing: {
        widest: '0.25em',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
