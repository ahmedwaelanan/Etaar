import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: 'rgba(255,255,255,0.03)',
        'surface-hover': 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.14)',
        gold: '#c9a96e',
        'gold-dim': 'rgba(201,169,110,0.15)',
        'gold-glow': 'rgba(201,169,110,0.25)',
        base: '#06060a',
      },
      fontFamily: {
        cairo: ['var(--font-cairo)', 'sans-serif'],
      },
      backdropBlur: {
        '2xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config