/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16a34a', // Green-600
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f3f4f6', // Gray-100
          foreground: '#1f2937', // Gray-800
        },
        destructive: {
            DEFAULT: '#ef4444', // Red-500
            foreground: '#ffffff',
        },
        muted: {
            DEFAULT: '#f3f4f6',
            foreground: '#6b7280',
        },
        accent: {
            DEFAULT: '#dbeafe', // Blue-100
            foreground: '#1e40af', // Blue-800
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'waveform': 'waveform 1.2s ease-in-out infinite',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1.5)' },
        }
      }
    },
  },
  plugins: [],
}
