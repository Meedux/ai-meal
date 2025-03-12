/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./component/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/preline/preline.js',
  ],
  plugins: [require("daisyui")],
  // extend: {
  //   colors: {
  //     // you can either spread `colors` to apply all the colors
  //     ...colors,
  //     // or add them one by one and name whatever you want
  //     amber: colors.amber,
  //     emerald: colors.emerald,
  //   }
  // }
};

export default config;
