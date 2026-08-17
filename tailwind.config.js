/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#56397d',      // deep purple
        cream: '#faf8f5',
        offwhite: '#f5f2ee',
        warmgray: '#e8e3dc',
        accent: '#c8a96e',      // gold
        'accent-dark': '#a8893e',
        green: '#4a7c59',
        line: '#ddd8d0',
      },
    },
  },
  plugins: [],
}
