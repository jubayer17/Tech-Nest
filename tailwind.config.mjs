/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "alarm-vibrate": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "12.5%": { transform: "translate(-2px, -2px)" },
          "25%": { transform: "translate(2px, 2px)" },
          "37.5%": { transform: "translate(-2px, 2px)" },
          "50%": { transform: "translate(2px, -2px)" },
          "62.5%": { transform: "translate(-2px, -2px)" },
          "75%": { transform: "translate(2px, 2px)" },
          "87.5%": { transform: "translate(-2px, 2px)" },
        },
      },
      animation: {
        "alarm-vibrate": "alarm-vibrate 0.5s linear",
      },
    },
  },
  plugins: [],
};
