/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7c3aed',
          blue: '#2563eb',
          cyan: '#0891b2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, rgba(15, 10, 30, 0.8) 0%, rgba(5, 5, 15, 0.9) 100%)',
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.35)',
        'glow-blue': '0 0 20px rgba(37, 99, 235, 0.35)',
        'glow-cyan': '0 0 20px rgba(8, 145, 178, 0.35)',
        'glass-inset': 'inset 0 1px 1px rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
