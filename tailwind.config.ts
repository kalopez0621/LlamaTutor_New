import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "898px",
    },

    container: {
      center: true,
    },
    extend: {
      colors: {
        // Friendly color palette for middle school students
        primary: "#FF7F50", // Coral for main elements
        secondary: "#FFD700", // Gold for highlights
        background: "#F0F8FF", // Light blue for background
        accent: "#90EE90", // Light green for accents
        danger: "#FF6347", // Tomato red for errors
        gray: colors.neutral,
      },
      fontFamily: {
        // Playful fonts
        body: ["Comic Sans MS", "Arial", "sans-serif"], // Body text
        header: ["Caveat", "cursive"], // Headers and titles
      },
      backgroundImage: {
        // Updated gradients for a fun look
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "custom-gradient":
          "linear-gradient(150deg, #FF7F50 1.28%, #FFD700 90.75%)", // Friendly custom gradient
        "fun-pattern": "url('/public/new-bg.png')", // Add a math-themed background image here
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
