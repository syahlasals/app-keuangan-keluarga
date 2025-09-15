/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7fc',
          100: '#e1eff9',
          200: '#c3dff3',
          300: '#a5cfee',
          400: '#87bfe8',
          500: '#124170', // Deep Blue - Primary color
          600: '#124170', // Deep Blue - Primary color
          700: '#0e3054', // Darker shade
          800: '#0a2038', // Even darker shade
          900: '#06101c', // Darkest shade
        },
        secondary: {
          50: '#f0f8fa',
          100: '#e1f0f5',
          200: '#c3e1eb',
          300: '#a5d2e1',
          400: '#87c3d7',
          500: '#26667F', // Teal Blue - Secondary color
          600: '#26667F', // Teal Blue - Secondary color
          700: '#1c4d5f', // Darker shade
          800: '#13333f', // Even darker shade
          900: '#091a1f', // Darkest shade
        },
        accent: {
          50: '#f0faf5',
          100: '#e1f5eb',
          200: '#c3ebd7',
          300: '#a5e1c3',
          400: '#87d7af',
          500: '#67C090', // Fresh Green - Accent color
          600: '#67C090', // Fresh Green - Accent color
          700: '#3ea86f', // Darker shade
          800: '#32875a', // Even darker shade
          900: '#266544', // Darkest shade
        },
        background: {
          50: '#f5fcf9', // Mint Whisper - Background color (now primary)
          100: '#f5fcf9',
          200: '#f5fcf9',
          300: '#f5fcf9',
          400: '#f5fcf9',
          500: '#F5FCF9', // Mint Whisper - Background color (now primary)
          600: '#F5FCF9', // Mint Whisper - Background color (now primary)
          700: '#f5fcf9',
          800: '#f5fcf9',
          900: '#f5fcf9',
        },
        'background-hint': {
          50: '#ddf4e7',
          100: '#ddf4e7',
          200: '#ddf4e7',
          300: '#ddf4e7',
          400: '#ddf4e7',
          500: '#DDF4E7', // Mint Soft - Background hint color (lighter shade)
          600: '#DDF4E7', // Mint Soft - Background hint color (lighter shade)
          700: '#ddf4e7',
          800: '#ddf4e7',
          900: '#ddf4e7',
        },
        text: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0F172A', // Dark Gray Navy - Text color
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#67C090', // Using accent color for success
          600: '#67C090', // Using accent color for success
          700: '#3ea86f',
          800: '#32875a',
          900: '#266544',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(18, 65, 112, 0.1), 0 2px 4px -1px rgba(18, 65, 112, 0.06)',
        'soft-lg': '0 10px 15px -3px rgba(18, 65, 112, 0.1), 0 4px 6px -2px rgba(18, 65, 112, 0.06)',
        'soft-xl': '0 20px 25px -5px rgba(18, 65, 112, 0.1), 0 10px 10px -5px rgba(18, 65, 112, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.15)',
        'glass-xl': '0 20px 60px 0 rgba(31, 38, 135, 0.2)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      opacity: {
        '75': '0.75',
        '80': '0.80',
        '85': '0.85',
        '90': '0.90',
        '95': '0.95',
      }
    },
  },
  plugins: [],
};