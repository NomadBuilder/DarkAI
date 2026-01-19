/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        public: '#2563eb',      // Blue for public institutions
        nonprofit: '#10b981',   // Green for non-profits
        forprofit: '#ef4444',   // Red for for-profit
        neutral: '#64748b',     // Gray for unclassified
        background: '#f8fafc',
        foreground: '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
