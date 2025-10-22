import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{astro,html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#ff6a00",
        "bg-dark": "#000000",
      },
    },
  },
  plugins: [],
};

export default config;
