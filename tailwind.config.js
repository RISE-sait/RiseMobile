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
  },
  plugins: [],
}