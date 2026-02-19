/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        karla: ["Karla", "sans-serif"],
        ibm: ["IBM Plex Sans", "sans-serif"],
      },
      keyframes: {
        rise: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0" },
          "10%": { opacity: "0.25" },
          "90%": { opacity: "0.25" },
          "100%": {
            transform: "translateY(-160vh) scale(1.1)",
            opacity: "0",
          },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        spinColors: {
          "0%": { "border-top-color": "var(--color-mono-black)" },
          "15%": { "border-top-color": "var(--color-primary-green)" },
          "30%": { "border-top-color": "var(--color-mono-gold)" },
          "45%": { "border-top-color": "var(--color-mono-silver)" },
          "60%": { "border-top-color": "var(--color-mono-black)" },
          "75%": { "border-top-color": "var(--color-primary-green)" },
          "90%": { "border-top-color": "var(--color-mono-gold)" },
          "100%": { "border-top-color": "var(--color-mono-silver)" },
        },
      },
      colors: {
        azul: {
          principal: "#1E40AF",
          oscuro: "#1E3A8A",
          claro: "#3B82F6",
          "muy-claro": "#DBEAFE",
          hover: "#2563EB",
        },
      },
      animation: {
        rise: "rise 22s linear infinite",
        spinSlow: "spinSlow 1s linear infinite",
        spinColors: "spinColors 3s linear infinite",
      },
    },
  },
  plugins: [],
};
