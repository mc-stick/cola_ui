/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'azul': {
          'principal': '#1E40AF',
          'oscuro': '#1E3A8A',
          'claro': '#3B82F6',
          'muy-claro': '#DBEAFE',
          'hover': '#2563EB',
        }
      }
    },
  },
  plugins: [],
}