/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        firela: {
          primary: "#e6620a",
          secondary: "#667eea",
          accent: "#764ba2",
        },
      },
    },
  },
  plugins: [],
}
