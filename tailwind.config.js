/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    // "./src/pages/**/*.{js,ts,jsx,tsx}",
    //  "./src/components/**/*.{js,ts,jsx,tsx}",
    // "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
      
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};