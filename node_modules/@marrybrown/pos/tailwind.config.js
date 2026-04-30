/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C0392B',
        secondary: '#E67E22',
        background: '#FFFFFF',
        text: '#222222',
      },
    },
  },
  plugins: [],
}