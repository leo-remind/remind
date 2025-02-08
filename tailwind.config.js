/** @type {import('tailwindcss').Config} */
const globSync = require('glob').sync;

module.exports = {
  content: [
    ...globSync('./app/**/*.tsx'),
    ...globSync('./components/**/*.tsx'),
    "./components/**/*.tsx",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
    fontFamily: {
      sans: ["DMSans_500Medium"],
      serif: ["DMSerifText_400Regular"]
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      blue: "#0066FF",
      "light-blue": "#4D94FF",
      orange: "#FF6200",
      "light-orange" : "#FF8133",
      green: "#31AE21"
    },
  },
  plugins: [],
};
