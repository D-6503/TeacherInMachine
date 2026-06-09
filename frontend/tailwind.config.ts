import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        brand: {
          50: '#fff5ec',
          100: '#ffe6d3',
          200: '#ffd0b0',
          300: '#ffb080',
          400: '#ff8647',
          500: '#ff6200',
          600: '#e04f00',
          700: '#b83a00',
          800: '#912d00',
          900: '#752500',
          950: '#421200',
        },
        violet: {
          50: '#fffcf7',
          100: '#ffebd4',
          200: '#ffd8ad',
          300: '#ffbf80',
          400: '#ffa14d',
          500: '#ff7d1a',
          600: '#e66205',
          700: '#bd4c00',
          800: '#943800',
          900: '#6b2500',
          950: '#401300',
        },
        indigo: {
          50: '#f0f8ff',
          100: '#e0f0fe',
          200: '#bae0fd',
          300: '#7cc4fc',
          400: '#38a3f8',
          500: '#0084c9',
          600: '#0966a3',
          700: '#0a5285',
          800: '#0c466e',
          900: '#0f3b5c',
          950: '#0a253d',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        navy: {
          800: '#0a1128',
          850: '#070d20',
          900: '#050814',
          950: '#03050c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient':
          'linear-gradient(135deg, #050814 0%, #0c1020 40%, #050814 70%, #03050c 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,158,83,0.08), rgba(230,126,34,0.04))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'floatDelayed 7s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255,158,83,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(255,158,83,0.7), 0 0 40px rgba(255,158,83,0.3)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        floatDelayed: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(255,158,83,0.4)',
        'glow-sm': '0 0 10px rgba(255,158,83,0.3)',
        'glow-lg': '0 0 40px rgba(255,158,83,0.5)',
        'glow-emerald': '0 0 20px rgba(52,211,153,0.4)',
        card: '0 4px 24px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 40px rgba(255,77,109,0.06), 0 4px 20px rgba(0,0,0,0.02)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
