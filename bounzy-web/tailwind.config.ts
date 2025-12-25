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
        alba: {
          beige: "#EDEEF0",
          chocolate: "#291D00",
          charcoal: "#171717",
          silver: "#B8B8B8",
          orange: "#934910",
          "orange-light": "#D4752A",
        },
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 10vw, 8rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.5rem, 8vw, 5rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2rem, 5vw, 3.5rem)", { lineHeight: "1", letterSpacing: "-0.01em" }],
      },
      letterSpacing: {
        ultra: "0.3em",
        "wide-custom": "0.15em",
      },
      transitionTimingFunction: {
        "out-quart": "cubic-bezier(0.22, 1, 0.36, 1)",
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
        smooth: "cubic-bezier(0.33, 1, 0.68, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-up-delay": "slideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards",
        "grain": "grain 8s steps(10) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -5%)" },
          "20%": { transform: "translate(-10%, 5%)" },
          "30%": { transform: "translate(5%, -10%)" },
          "40%": { transform: "translate(-5%, 15%)" },
          "50%": { transform: "translate(-10%, 5%)" },
          "60%": { transform: "translate(15%, 0)" },
          "70%": { transform: "translate(0, 10%)" },
          "80%": { transform: "translate(-15%, 0)" },
          "90%": { transform: "translate(10%, 5%)" },
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
