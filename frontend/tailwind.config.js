/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        oko: {
          bg:        '#14181c',
          surface:   '#1f2937',
          border:    '#374151',
          muted:     '#9ca3af',
          subtle:    '#6b7280',
          faint:     '#4b5563',
          text:      '#e5e7eb',
          red:       '#e84040',
          'red-dark':'#c42a2a',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'oko-gradient': 'linear-gradient(to bottom, transparent, #14181c)',
      },
    },
  },
  plugins: [],
};
