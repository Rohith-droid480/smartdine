/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Amber main
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          accent: '#eab308', // Warm Gold
        },
        dark: {
          bg: '#0f172a',      // Slate 900
          surface: '#1e293b', // Slate 800
          card: '#1e293b',
          muted: '#334155',   // Slate 700
          border: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
        'glow-gold': '0 0 30px -5px rgba(234, 179, 8, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(to right bottom, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
      },
    },
  },
  plugins: [],
};
