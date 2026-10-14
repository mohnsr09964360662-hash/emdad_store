import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Flat tokens:
        'emdad-primary': '#0D5C96',
        'emdad-primary-dark': '#094572',
        'emdad-turquoise': '#14B8A6',
        'emdad-turquoise-light': '#3DD9B3',
        'emdad-turquoise-dark': '#0D9488',
        'emdad-sky': '#38BDF8',
        'emdad-sky-light': '#E0F2FE',
        'emdad-sky-dark': '#0284C7',
        'emdad-teal': '#00A896',
        'emdad-surface': '#FFFFFF',
        'emdad-bg': '#F8FAFC',
        'emdad-border': '#E2E8F0',
        'emdad-text-main': '#0F172A',
        'emdad-text-muted': '#64748B',

        // Nested palette:
        emdad: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0D5C96', // Brand Primary
          800: '#094572',
          900: '#072E4C',
          primary: '#0D5C96',
          turquoise: '#14B8A6',
          sky: '#38BDF8',
          teal: '#00A896',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
        },
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'Cairo', 'sans-serif'],
      },
      maxWidth: {
        container: '1339px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
        'card': '0px 4px 4px 0px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 10px 20px -3px rgba(13, 92, 150, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        'skeleton-shimmer': {
          '0%': { transform: 'translateX(-150%) skewX(-12deg)' },
          '100%': { transform: 'translateX(150%) skewX(-12deg)' },
        },
        'badge-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
      },
      animation: {
        'skeleton-shimmer': 'skeleton-shimmer 1.6s ease-in-out infinite',
        'badge-bounce': 'badge-bounce 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
