/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
        display: ['"Baloo 2"', '"Be Vietnam Pro"', 'sans-serif'],
        label: ['"Space Grotesk"', '"Be Vietnam Pro"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f3f3f2',
          100: '#e7e7e5',
          200: '#cdcdca',
          300: '#acaca8',
          400: '#84847f',
          500: '#666660',
          600: '#4f4f4a',
          700: '#353532',
          800: '#1e1e1c',
          900: '#0a0a09',
        },
        ink: {
          50: '#f7f7f5',
          100: '#ecece8',
          200: '#d8d8d1',
          300: '#babab1',
          400: '#96968d',
          500: '#73736a',
          600: '#57574f',
          700: '#3f3f39',
          800: '#232320',
          900: '#10100f',
        },
        paper: {
          50: '#fcfcf8',
          100: '#f7f7f2',
          200: '#f0f0e7',
        },
        cream: {
          50: '#f8f8f3',
          100: '#efefe9',
          200: '#e5e5df',
        },
        mint: {
          50: '#f2f2ee',
          100: '#e6e6e0',
          200: '#d5d5ce',
          300: '#c3c3bc',
        },
      },
      boxShadow: {
        soft: '3px 4px 0 rgba(0, 0, 0, 0.8)',
        card: '6px 7px 0 rgba(0, 0, 0, 0.9)',
        ghost: '0 20px 40px rgba(0, 0, 0, 0.08)',
      },
      backgroundImage: {
        'paper-noise': 'radial-gradient(circle at 12% 20%, rgba(0,0,0,0.07) 0, transparent 35%), radial-gradient(circle at 84% 78%, rgba(0,0,0,0.06) 0, transparent 32%), radial-gradient(circle at 70% 18%, rgba(0,0,0,0.04) 0, transparent 28%)',
        scallop: 'radial-gradient(circle at 12px 0, transparent 12px, #f7f7f2 13px)',
      },
    },
  },
  plugins: [],
}
