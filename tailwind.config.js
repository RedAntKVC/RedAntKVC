/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff1f2",
          500: "#ef4444",
          600: "#dc2626",
          900: "#7f1d1d",
        },
      },
    },
  },
  plugins: [],
};
