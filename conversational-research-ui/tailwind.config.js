/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f8',
          100: '#d5e0f0',
          200: '#adc0e1',
          300: '#7a9ace',
          400: '#4d75bb',
          500: '#2d57a4',
          600: '#1e3f85',
          700: '#162e63',
          800: '#0f1f42',
          900: '#080f21',
          950: '#040810',
        },
        accent: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        surface: {
          light: '#f8fafc',
          dark:  '#0d1526',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-in':   'slideIn 0.25s ease-out',
        'slide-up':   'slideUp 0.2s ease-out',
        'pulse-soft': 'pulseSoft 1.5s ease-in-out infinite',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn:   { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        slideUp:   { from: { transform: 'translateY(10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
        bounceDot: {
          '0%,80%,100%': { transform: 'translateY(0)' },
          '40%':          { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'card':     '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        'card-md':  '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        'card-lg':  '0 8px 32px rgba(0,0,0,0.16)',
        'glow':     '0 0 20px rgba(59,130,246,0.25)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
