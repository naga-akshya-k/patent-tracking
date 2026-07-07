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
        brand: {
          50: '#fdf2f4',
          100: '#fbe5e8',
          200: '#f7ccd3',
          300: '#f0a3b0',
          400: '#e46f84',
          500: '#6B1E2B',
          600: '#5a1823',
          700: '#4b121b',
          800: '#3d0d14',
          900: '#30090e',
          950: '#1b0205',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
