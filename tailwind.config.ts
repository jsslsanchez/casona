import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-brown': '#5E3023',
        'rich-mahogany': '#8B2500',
        'soft-beige': '#F7EDE2',
        'warm-sand': '#E6D2B7',
        'boyaca-green': '#6B8E23',
        'golden-yellow': '#DAA520',
        'terracotta-red': '#A0522D',
        // Add other colors if needed
      },
      borderRadius: {
        'lg': '12px',
        // Add other customizations if needed
      },
    },
  },
  plugins: [],
};
export default config;
