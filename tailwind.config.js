/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        "main-blue": "#0E38B1",
        "main-red": "#AE0000",
        "main-yellow": "#eab308",
      },
    },
  },
  plugins: [],
};
