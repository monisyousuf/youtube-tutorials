/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Roboto Serif"', "Georgia", "serif"],
        body: ["Nunito", "system-ui", "sans-serif"],
      },
      colors: {
        vsc: {
          bg:       "#1e1e1e",
          surface:  "#252526",
          elevated: "#2d2d2d",
          input:    "#3c3c3c",
          border:   "#454545",
          text:     "#d4d4d4",
          muted:    "#858585",
          sidebar:  "#333333",
          btn:      "#0e639c",
          btnHover: "#1177bb",
        },
        claude: {
          DEFAULT: "#e07040",   // sidebar active-bar accent only
        },
        accent: {
          DEFAULT: "rgb(78,142,211)",
          hover:   "rgb(109,163,225)",
        },
      },
    },
  },
  plugins: [],
};
