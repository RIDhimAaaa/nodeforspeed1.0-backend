/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        'screen': '100vw',
        'full': '100%',
      },
      maxWidth: {
        'none': 'none',
        'full': '100%',
      },
    },
  },
  plugins: [],
} 