/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor:{
        "BLACK-MARKET":"#1d2345",
      },
      colors: {
        "dark-purple": "#151719",
        "darkest-purple": "#061339",
        "light-white": "rgba(255,255,255,0.17)",
        'dark-blue': 'rgba(255,255,255,0.17)',
        'blue-900': '#081A51',
        'darks-blue': '#1D2345',
        'light-gray':'#242A4B',
        'light-dasboard-gray':'#1B1E21',
      },
    },
  },
  plugins: [],
}