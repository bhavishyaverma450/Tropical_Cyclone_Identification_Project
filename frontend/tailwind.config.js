/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050811',
          900: '#0a0f1d',
          850: '#0f172a',
          800: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
