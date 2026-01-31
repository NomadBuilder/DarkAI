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
        // Brand blue (logo/nav) — use these so dev and prod match
        'brand-blue': '#2E4A6B',
        'brand-blue-light': '#3d5a7a',
        'brand-blue-lighter': '#4a6a8a',
        'brand-blue-hero': '#e8ecf2',   // hero gradient bottom
        'brand-blue-hero-mid': '#f0f3f7',
        'brand-blue-hero-top': '#f6f8fb', // blends with white nav
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
