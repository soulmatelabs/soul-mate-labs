/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0A0A0A',
        lunar: '#93C5FD',
        surface: '#171717',
        // Semantic aliases for easier editing
        accent: {
          DEFAULT: '#93C5FD', // lunar
          soft: 'rgba(147, 197, 253, 0.3)',
        },
        content: {
          title: '#FFFFFF',
          heading: '#E5E7EB', // gray-200
          body: '#D1D5DB',    // gray-300
          muted: '#9CA3AF',   // gray-400
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}