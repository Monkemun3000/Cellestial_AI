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
            // Dark Gray Theme with White Outlines
            'dark-gray': '#1a1a1a',
            'darker-gray': '#0f0f0f',
            'light-gray': '#2a2a2a',
            'white-outline': '#ffffff',
            'white-text': '#ffffff',
            'gray-text': '#cccccc',
            'accent-white': '#ffffff',
            'accent-gray': '#666666',
            
            // Legacy colors for compatibility
            cosmic: {
              deep: '#1a1a1a',      // Dark gray
              nebula: '#2a2a2a',    // Light gray
              stellar: '#0f0f0f',   // Darker gray
              aurora: '#ffffff',    // White
              plasma: '#ffffff',    // White
            },
            bio: {
              forest: '#1a1a1a',    // Dark gray
              moss: '#2a2a2a',      // Light gray
              leaf: '#ffffff',      // White
              algae: '#ffffff',     // White
              cell: '#ffffff',      // White
            },
            accent: {
              cosmic: '#ffffff',    // White
              bio: '#ffffff',       // White
              hybrid: '#ffffff',    // White
              glow: '#ffffff',      // White
            },
            // Legacy NASA colors for compatibility
            nasa: {
              blue: '#0B3D91',
              red: '#FC3D21',
              white: '#FFFFFF',
            },
          },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
