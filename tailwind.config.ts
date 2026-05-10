import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-elevated': '#222222',
        primary: {
          DEFAULT: '#0d9488',
          hover: '#0f766e',
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.9)',
          secondary: 'rgba(255, 255, 255, 0.6)',
          muted: 'rgba(255, 255, 255, 0.5)',
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          strong: 'rgba(255, 255, 255, 0.12)',
        },
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        pill: '9999px',
      },
      boxShadow: {
        elevated:
          'rgba(0, 0, 0, 0.3) 0 0 0 1px, rgba(0, 0, 0, 0.4) 0 2px 6px, rgba(0, 0, 0, 0.5) 0 4px 8px',
        search: 'rgba(0, 0, 0, 0.2) 0 2px 8px',
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-button': 'pulseButton 1s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        pulseButton: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13, 148, 136, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(13, 148, 136, 0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config