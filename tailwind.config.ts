import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Custom color palette - minimal approach
        amaranth: {
          50: "#fdf2f5",
          100: "#fce7ed",
          200: "#f9d0dc",
          300: "#f4a8c0",
          400: "#ed7ba0",
          500: "#e08dac", // Main color
          600: "#d16b94",
          700: "#b8527a",
          800: "#984465",
          900: "#7d3a56",
        },
        glaucous: {
          50: "#f0f2fe",
          100: "#e4e8fc",
          200: "#cdd4f9",
          300: "#aab8f4",
          400: "#8396ed",
          500: "#6a7fdb", // Main color
          600: "#5562ca",
          700: "#4750b0",
          800: "#3d4390",
          900: "#363c74",
        },
        cyan: {
          50: "#f0fefe",
          100: "#ccfbfc",
          200: "#9ff6f8",
          300: "#66ecf0",
          400: "#57e2e5", // Main color
          500: "#2dd4d7",
          600: "#26a8b5",
          700: "#268692",
          800: "#286c76",
          900: "#255a63",
        },
        eerie: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#1f1e1f", // Main color
        },
        vanilla: {
          50: "#fefcf3",
          100: "#fef8e1",
          200: "#fdefc2",
          300: "#fbe298",
          400: "#e8da9b", // Main color
          500: "#f5c842",
          600: "#e5a635",
          700: "#c0842e",
          800: "#9c682a",
          900: "#7f5627",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
