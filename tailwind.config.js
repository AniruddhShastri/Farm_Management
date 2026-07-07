/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mist: {
          DEFAULT: 'var(--voneng-muted)',
          dim: 'var(--voneng-muted-2)',
        },
        brand: {
          green: 'var(--voneng-green)',
          bright: 'var(--voneng-green-bright)',
          amber: 'var(--voneng-accent)',
        },
      },
      fontFamily: {
        display: ['Syne', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}

