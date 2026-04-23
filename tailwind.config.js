/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E8C97A',
          dark: '#B8943D',
          muted: '#8A7A5A',
        },
        dark: {
          900: '#0A0A0A',
          800: '#0E0E0E',
          700: '#111111',
          600: '#161616',
          500: '#1A1A1A',
          400: '#222222',
          300: '#2A2A2A',
          200: '#333333',
          100: '#444444',
        },
        cream: '#F0EDE8',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '2px',
        md: '2px',
        lg: '2px',
        xl: '4px',
      },
    },
  },
  plugins: [],
}
