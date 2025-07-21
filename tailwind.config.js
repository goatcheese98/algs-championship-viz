/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Integrate with our existing design tokens
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // Our main --color-primary
          600: '#dc2626', // Our --color-primary-dark
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24', // Our --color-accent-light
          500: '#d97706', // Our main --color-accent
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        gray: {
          50: '#f8fafc',  // Our --color-text-light
          100: '#f1f5f9', // Our --color-text-primary
          200: '#e2e8f0',
          300: '#cbd5e1', // Our --color-text-muted
          400: '#94a3b8', // Our --color-text-subtle
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        dark: {
          primary: '#1a0f0f',   // Our --color-bg-primary
          secondary: '#2d1b1b', // Our --color-bg-secondary
          tertiary: '#0f0f0f',  // Our --color-bg-tertiary
        }
      },
      spacing: {
        // Map our design tokens to Tailwind spacing
        'xs': '3px',   // --spacing-xs
        'sm': '4px',   // --spacing-sm
        'md': '6px',   // --spacing-md
        'lg': '8px',   // --spacing-lg
        'xl': '10px',  // --spacing-xl
        '2xl': '12px', // --spacing-2xl
        '3xl': '14px', // --spacing-3xl
        '4xl': '16px', // --spacing-4xl
        '5xl': '20px', // --spacing-5xl
        '6xl': '24px', // --spacing-6xl
        '7xl': '30px', // --spacing-7xl
        '8xl': '40px', // --spacing-8xl
        '9xl': '60px', // --spacing-9xl
        '10xl': '80px', // --spacing-10xl
        '11xl': '100px', // --spacing-11xl
      },
      fontSize: {
        // Map our text tokens
        '2xs': ['0.65rem', { lineHeight: '1.2' }], // --text-2xs
        'xs': ['0.7rem', { lineHeight: '1.2' }],   // --text-xs
        'sm': ['0.75rem', { lineHeight: '1.2' }],  // --text-sm
        'base': ['0.8rem', { lineHeight: '1.4' }], // --text-base (most common)
        'md': ['0.85rem', { lineHeight: '1.4' }],  // --text-md
        'lg': ['0.9rem', { lineHeight: '1.4' }],   // --text-lg
        'xl': ['0.95rem', { lineHeight: '1.4' }],  // --text-xl
        '2xl': ['1rem', { lineHeight: '1.4' }],    // --text-2xl
        '3xl': ['1.1rem', { lineHeight: '1.4' }],  // --text-3xl
        '4xl': ['1.2rem', { lineHeight: '1.4' }],  // --text-4xl
        '5xl': ['1.3rem', { lineHeight: '1.6' }],  // --text-5xl
        '6xl': ['1.8rem', { lineHeight: '1.6' }],  // --text-6xl
      },
      borderRadius: {
        // Map our radius tokens
        'xs': '1px',  // --radius-xs
        'sm': '2px',  // --radius-sm
        'base': '3px', // --radius-base
        'md': '4px',  // --radius-md
        'DEFAULT': '6px', // --radius-lg (most common)
        'lg': '6px',  // --radius-lg
        'xl': '8px',  // --radius-xl
        '2xl': '10px', // --radius-2xl
        '3xl': '12px', // --radius-3xl
        '4xl': '16px', // --radius-4xl
        '5xl': '18px', // --radius-5xl
        '6xl': '20px', // --radius-6xl
      },
      transitionDuration: {
        // Map our animation tokens
        'fast': '0.2s',   // --duration-base
        'base': '0.25s',  // --duration-medium
        'slow': '0.3s',   // --duration-slow
      },
      boxShadow: {
        // Map our shadow tokens
        'sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
        'DEFAULT': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.3)',
        'lg': '0 8px 16px rgba(0, 0, 0, 0.6)',
        'xl': '0 12px 24px rgba(0, 0, 0, 0.6)',
        '2xl': '0 16px 32px rgba(0, 0, 0, 0.5)',
        // Glow effects
        'primary': '0 0 8px rgba(239, 68, 68, 0.3)',
        'primary-strong': '0 0 15px rgba(239, 68, 68, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
        'accent': '0 0 8px rgba(217, 119, 6, 0.3)',
        'accent-strong': '0 0 12px rgba(217, 119, 6, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}