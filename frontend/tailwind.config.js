/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nibmBlue: '#0b3d91', // Professional University Blue
        nibmRed: '#d71920',  // Energetic Accent Red
        nibmGray: '#f4f7f6', // Soft background
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}