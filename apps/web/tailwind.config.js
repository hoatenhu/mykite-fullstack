/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef0fb',
          100: '#dce2f4',
          200: '#c7ccea',
          300: '#a7add9',
          400: '#8288bb',
          500: '#656bb0',
          600: '#4d539f',
          700: '#2f398e',
          800: '#252e73',
          900: '#1d2357',
        },
        ink: {
          50: '#f7f7fb',
          100: '#ededf6',
          200: '#d4d7e9',
          300: '#b0b7d1',
          400: '#8a93b0',
          500: '#67708e',
          600: '#4c536c',
          700: '#34384e',
          800: '#202332',
          900: '#0f0f0f',
        },
        cream: {
          50: '#fffdf2',
          100: '#fff7d4',
          200: '#fff1b6',
        },
        mint: {
          50: '#f0fbf7',
          100: '#ddf6ea',
          200: '#b6ebd0',
          300: '#84dbaf',
        },
      },
      boxShadow: {
        soft: '0 20px 45px -24px rgba(47, 57, 142, 0.35)',
        card: '0 18px 40px -26px rgba(32, 35, 50, 0.18)',
      },
      backgroundImage: {
        'brand-glow': 'radial-gradient(circle at top left, rgba(220, 226, 244, 0.9), transparent 42%), radial-gradient(circle at top right, rgba(255, 241, 182, 0.6), transparent 32%)',
      },
    },
  },
  plugins: [],
}
