/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC2626',
          dark: '#B91C1C',
        },
        dark: {
          DEFAULT: '#000000',
          lighter: '#1a1a1a',
          light: '#2a2a2a',
        }
      }
    },
  },
  plugins: [],
}
