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
        canvas: '#FFFBEB',
        surface: '#FFFFFF',
        'surface-elevated': '#FEF3C7',
        primary: {
          DEFAULT: '#EAB308',
          hover: '#CA8A04',
        },
        accent: '#FF6B35',
        text: {
          primary: '#1A1A1A',
          secondary: '#4A4A4A',
          muted: '#7A7A7A',
        },
        border: {
          DEFAULT: '#1A1A1A',
          strong: '#1A1A1A',
        },
        error: '#DC2626',
        neon: {
          yellow: '#EAB308',
          pink: '#EC4899',
          blue: '#3B82F6',
          green: '#22C55E',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      borderRadius: {
        card: '4px',
        pill: '9999px',
        brutal: '8px',
      },
      boxShadow: {
        elevated: '4px 4px 0px 0px #1A1A1A',
        search: '3px 3px 0px 0px #1A1A1A',
        brutal: '4px 4px 0px 0px #1A1A1A',
        'brutal-sm': '2px 2px 0px 0px #1A1A1A',
        'brutal-lg': '6px 6px 0px 0px #1A1A1A',
        'brutal-hover': '6px 6px 0px 0px #1A1A1A',
        'brutal-yellow': '4px 4px 0px 0px #EAB308',
        'brutal-pink': '4px 4px 0px 0px #EC4899',
        'brutal-neon': '4px 4px 0px 0px #22C55E',
      },
      borderWidth: {
        DEFAULT: '1px',
        brutal: '2px',
        'brutal-thick': '3px',
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-button': 'pulseButton 1s ease-in-out infinite',
        'heart-pop': 'heartPop 0.4s ease-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(234, 179, 8, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(234, 179, 8, 0)' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.3)' },
          '60%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-3deg)' },
          '75%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}
export default config