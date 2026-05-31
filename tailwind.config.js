/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cc-maroon': '#8B1A1A',
        'cc-gold': '#C49B3A',
        'cc-green': '#2C5F2E',
        'cc-teal': '#2E6B6E',
        'cc-offwhite': '#F8F5F0',
        'cc-cream': '#F0EDE6',
        'cc-navy': '#2B2B2B',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        sans: ['"Source Sans Pro"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}