/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand Colors ────────────────────────────────────────
        forge: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a4b8fc',
          400: '#7b8ff9',
          500: '#5b6ef4',
          600: '#3d4ee8',
          700: '#2f3ed0',
          800: '#2835a9',
          900: '#263185',
          950: '#181e4d',
        },
        // ─── Accent ──────────────────────────────────────────────
        amber: {
          ai: '#f59e0b',
        },
        // ─── Semantic ────────────────────────────────────────────
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        surface: {
          DEFAULT: 'var(--surface-primary)',
          glass: 'var(--surface-glass)',
          elevated: 'var(--surface-elevated)',
        },
        card: 'var(--bg-card)',
        glass: {
          DEFAULT: 'var(--bg-glass)',
          hover: 'var(--bg-glass-hover)',
        },
        border: {
          DEFAULT: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          glow: 'var(--border-glow)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
        },
        status: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'glass-sm': '0 4px 12px 0 rgba(0, 0, 0, 0.05)',
        'glass-md': '0 8px 24px 0 rgba(0, 0, 0, 0.05)',
        'glass-lg': '0 16px 40px 0 rgba(0, 0, 0, 0.1)',
        'glow-sm': '0 0 10px rgba(91, 110, 244, 0.15)',
        'glow-md': '0 0 20px rgba(91, 110, 244, 0.25)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        blob: 'blob 7s infinite',
        marquee: 'marquee 25s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'forge-gradient': 'linear-gradient(135deg, #181e4d 0%, #2835a9 50%, #5b6ef4 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      },
    },
  },
  plugins: [],
}
