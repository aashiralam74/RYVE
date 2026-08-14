/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ryve: {
          black: "#0A0A0A",
          charcoal: "#171717",
          card: "#1F1F1F",
          border: "#2E2E2E",
          muted: "#8E8E93",
          accent: "#DC2626", // Bold Streetwear Red
          accentHover: "#B91C1C",
          gold: "#D4AF37"
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Cabinet Grotesk"', 'sans-serif', 'system-ui']
      },
      letterSpacing: {
        widest: '.2em',
      }
    },
  },
  plugins: [],
}
