/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily:{
        bebas: ["Bebas-Neue", "sans-serif"],
        oswald: ["Oswald-Bold", "sans-serif"],
        "Oswald-Light": ["Oswald-Light", "sans-serif"],
        "Oswald-ExtraLight": ["Oswald-ExtraLight", "sans-serif"],
        "Oswald-Regular": ["Oswald-Regular", "sans-serif"],
        "Oswald-Medium": ["Oswald-Medium", "sans-serif"],
        "Oswald-SemiBold": ["Oswald-SemiBold", "sans-serif"],
        "Oswald-Bold": ["Oswald-Bold", "sans-serif"],
        outfit: ["Outfit-Black", "sans-serif"],
        "Outfit-Light": ["Outfit-Light", "sans-serif"],
        "Outfit-ExtraLight": ["Outfit-ExtraLight", "sans-serif"],
        "Outfit-Regular": ["Outfit-Regular", "sans-serif"],
        "Outfit-Medium": ["Outfit-Medium", "sans-serif"],
        "Outfit-SemiBold": ["Outfit-SemiBold", "sans-serif"],
        "Outfit-Bold": ["Outfit-Bold", "sans-serif"],
        "Outfit-ExtraBold": ["Outfit-ExtraBold", "sans-serif"],
        "Outfit-Thin": ["Outfit-Thin", "sans-serif"],
        protest: ["ProtestStrike-Regular", "sans-serif"],
        
      }
    },
    colors: {
      gold:{
        100: "#EFBF04",
        200: "#c2b067",
      },
        black:{
          100: "#000000",
          200: "#1A1A1A",
          300: "#2D2D2D",
          400: "#333333",
          500: "#3C3C3C",
          600: "#4D4D4D",
          700: "#5E5E5E",
          800: "#6E6E6E",
          900: "#7F7F7F",

        },
        white:{
          100: "#FFFFFF",
          200: "#F9F9F9",
          300: "#F3F3F3",
          400: "#EDEDED",
          500: "#E7E7E7",
          600: "#E0E0E0",
          700: "#D9D9D9",
          800: "#D2D2D2",
          900: "#CBCBCB",
        },
        gray:{
          100: "#F9F9F9",
          200: "#F3F3F3",
          300: "#EDEDED",
          400: "#E7E7E7",
          500: "#E0E0E0",
          600: "#D9D9D9",
          700: "#D2D2D2",
          800: "#585858",
          900: "#4A4A4A",
        },
      }
  },
  plugins: [],
}