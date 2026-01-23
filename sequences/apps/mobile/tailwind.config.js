/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        border: 'hsl(215 28% 17%)',
        background: 'hsl(224 71% 4%)',
        foreground: 'hsl(213 31% 91%)',
        primary: {
          DEFAULT: 'hsl(217 91% 60%)',
          foreground: 'hsl(0 0% 100%)',
        },
        muted: {
          DEFAULT: 'hsl(215 28% 17%)',
          foreground: 'hsl(217 10% 64%)',
        },
        card: {
          DEFAULT: 'hsl(224 71% 4%)',
          foreground: 'hsl(213 31% 91%)',
        },
      },
    },
  },
  plugins: [],
};
