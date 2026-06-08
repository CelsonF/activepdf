/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4f46e5",
          dark: "#4338ca",
          light: "#eef2ff",
        },
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        brand: "0 2px 8px rgba(79,70,229,0.35)",
        "brand-lg": "0 4px 16px rgba(79,70,229,0.4)",
        "brand-hover": "0 4px 12px rgba(79,70,229,0.4)",
        success: "0 2px 8px rgba(5,150,105,0.35)",
        card: "0 1px 4px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        "upload-gradient":
          "linear-gradient(135deg, #f0f4ff 0%, #f8fafc 55%, #faf5ff 100%)",
      },
    },
  },
  plugins: [],
};
