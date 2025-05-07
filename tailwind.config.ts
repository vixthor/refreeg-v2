import type { Config } from "tailwindcss"

const config = {
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
        customBlueGray: '#323F49',
  			customNavyBlue: '#214570',
  			customNavyBlue2: '#183251',
  			palette: {
  				baseWhite: '#fafafa',
  				baseBlack: '#0a0a0b',
  				primary: '#003366',
  				secondary: '#828F9B',
  				success: '#004D40',
  				warning: '#F4C790',
  				error: '#E4626F',
  				gray01: '#424242',
  				dodgerBlue: '#1E90FF'
  			},
  			primaryShades: {
  				'100': '#d6ebff',
  				'200': '#add6ff',
  				'300': '#85c2ff',
  				'400': '#5cadff',
  				'500': '#3399ff',
  				'600': '#0a85ff',
  				'700': '#0070e0',
  				'800': '#005cb8',
  				'900': '#00478f',
  				'1000': '#00264c'
  			},
  			secondaryShades: {
  				'100': '#e1f3fa',
  				'200': '#c3e6f5',
  				'300': '#a5daf0',
  				'400': '#66c1e6',
  				'500': '#45b3e0',
  				'600': '#25a6db',
  				'700': '#1f8dba',
  				'800': '#1a7499',
  				'900': '#145b78',
  				'1000': '#0f4257'
  			},
  			neutrals: {
  				'100': '#e3e3e3',
  				'200': '#cccbcb',
  				'300': '#b5b3b3',
  				'400': '#9f9c9c',
  				'500': '#898384',
  				'600': '#726c6c',
  				'700': '#5a5555',
  				'800': '#433e3f',
  				'900': '#2b2829',
  				'1000': '#151314'
  			},
  			successShades: {
  				'100': '#c1fff5',
  				'200': '#83ffea',
  				'300': '#45ffe0',
  				'400': '#08ffd5',
  				'500': '#00c9a7',
  				'600': '#008b73',
  				'700': '#003c32'
  			},
  			warningShades: {
  				'100': '#f4c790',
  				'200': '#eda145',
  				'300': '#cc7914'
  			},
  			errorShades: {
  				'100': '#e4626f',
  				'200': '#c03744',
  				'300': '#8c1823'
  			},
  			grayShades: {
  				'100': '#eaeaea',
  				'200': '#d5d5d5',
  				'300': '#c0c0c0',
  				'400': '#ababab',
  				'500': '#969696',
  				'600': '#818181',
  				'700': '#6c6c6c',
  				'800': '#575757',
  				'900': '#353535',
  				'1000': '#272727'
  			},
  			dodgerBlueShades: {
  				'100': '#d9ecff',
  				'200': '#b4daff',
  				'300': '#8fc8ff',
  				'400': '#69b5ff',
  				'500': '#44a3ff',
  				'600': '#007ef8',
  				'700': '#006bd3',
  				'800': '#0058ae',
  				'900': '#004589',
  				'1000': '#003264'
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          ring: "hsl(var(--sidebar-ring))",
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

