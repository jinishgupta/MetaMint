/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00dc82',
          dark: '#00b368',
          light: '#4ade80',
        },
        secondary: {
          DEFAULT: '#6c5ce7',
          dark: '#5b4bd3',
        },
        accent: {
          DEFAULT: '#ff6b6b',
          light: '#ff8e8e',
        },
        background: '#0a0b0e',
        surface: {
          DEFAULT: '#16171b',
          light: '#1f2028',
          lighter: '#2a2b35',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a0a0a0',
          muted: '#6b7280',
        },
        border: {
          DEFAULT: '#2d2f36',
          light: '#3a3b44',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))',
        'accent-gradient-hover': 'linear-gradient(135deg, var(--tw-gradient-to), var(--tw-gradient-from))',
        'radial-gradient-1': 'radial-gradient(circle at 20% 80%, rgba(108, 92, 231, 0.12) 0%, transparent 50%)',
        'radial-gradient-2': 'radial-gradient(circle at 80% 20%, rgba(0, 220, 130, 0.12) 0%, transparent 50%)',
        'radial-gradient-3': 'radial-gradient(circle at 40% 40%, rgba(255, 107, 107, 0.08) 0%, transparent 50%)',
        'main-gradient': 'linear-gradient(135deg, #0a0b0e 0%, #0f1015 100%)',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.15)',
        DEFAULT: '0 8px 25px rgba(0, 0, 0, 0.2)',
        lg: '0 16px 40px rgba(0, 0, 0, 0.3)',
        xl: '0 25px 60px rgba(0, 0, 0, 0.4)',
        glow: '0 0 30px rgba(0, 220, 130, 0.3)',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        DEFAULT: '300ms',
        fast: '150ms',
        slow: '500ms',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-30px) rotate(120deg)' },
          '66%': { transform: 'translateY(30px) rotate(240deg)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        slideInUp: {
          'from': { opacity: '0', transform: 'translateY(50px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 20s ease-in-out infinite',
        'float-delayed': 'float 20s ease-in-out infinite 10s',
        slideDown: 'slideDown 0.3s ease-out',
        shimmer: 'shimmer 2s ease-in-out infinite',
        slideInUp: 'slideInUp 0.8s ease-out',
        fadeInUp: 'fadeInUp 1s ease-out',
      },
    },
  },
  plugins: [],
}
