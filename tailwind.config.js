/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'github-blue': '#0969da',
      },
      fontFamily: {
        'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'monospace'],
      },
    },
  },
  plugins: [],
}
