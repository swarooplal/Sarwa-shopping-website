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
      // ── Brand palette (logo-inspired) ─────────────────────────────
      // Deep Burgundy / Maroon — primary brand color (formerly "primary")
      // Terracotta / Coral — secondary accent (formerly "champagne")
      // Warm Ivory / Cream — primary background (formerly "ivory")
      // Soft Peach / Blush — subtle background sections
      // Warm Brown — typography & secondary elements (formerly "charcoal")
      // Off-white — cards & content areas
      colors: {
        primary: {
          DEFAULT: '#6E2233', // deep burgundy / maroon
          50: '#FBF3F4',
          100: '#F4DCE0',
          200: '#E5B0B9',
          300: '#C97D8B',
          400: '#A14C5E',
          500: '#6E2233',
          600: '#5A1B2A',
          700: '#451422',
          800: '#330E1A',
          900: '#220811',
        },
        ivory: {
          DEFAULT: '#FAF4EC', // warm ivory / cream
          50: '#FBF7F0',
          100: '#F4ECDF',
          200: '#EADFC8',
        },
        champagne: {
          // Renamed semantically: this slot now holds the terracotta accent.
          DEFAULT: '#C5654A', // terracotta / coral
          50: '#FBEDE7',
          100: '#F5D2C2',
          200: '#E9A98C',
          300: '#D88060',
          400: '#C5654A',
          500: '#A24E37',
          600: '#823C28',
        },
        peach: {
          DEFAULT: '#F4D7C8', // soft peach / blush — subtle backgrounds
          50: '#FCF1EA',
          100: '#F8E0CF',
          200: '#F4D7C8',
          300: '#EDBFA5',
        },
        charcoal: {
          // Now warm brown for typography & secondary elements.
          DEFAULT: '#3E2A20',
          50: '#F5EFEA',
          100: '#E6D9CE',
          200: '#C7B0A0',
          300: '#9E826F',
          400: '#6F5446',
          500: '#523B2D',
          600: '#3E2A20',
        },
        cream: {
          DEFAULT: '#FFFCF7', // off-white for cards / content areas
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Softer, more boutique-y shadows — no harsh blacks, warm tint.
        luxury: '0 24px 48px -20px rgba(62, 42, 32, 0.10)',
        soft: '0 8px 24px -14px rgba(62, 42, 32, 0.08)',
        // legacy "gold" shadow kept but rebranded to a warm terracotta glow
        gold: '0 16px 32px -16px rgba(197, 101, 74, 0.30)',
      },
      letterSpacing: {
        widest: '0.25em',
      },
      borderRadius: {
        // Slightly tighter — boutique sites rarely use big pillowy radii.
        xl2: '0.875rem',
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