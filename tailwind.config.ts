import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // New Cinematic Dark Theme Palette
        'deep-charcoal': '#0D0D0F',
        'dark-crimson': '#7A0F14',
        'rich-blood-red': '#A4161A',
        'glow-red': '#3E0A0C',
        'card-bg': '#151518',
        'surface-elevated': '#1C1C20',
        primary: '#E8E6E3',      // Primary Text
        secondary: '#A1A1AA',    // Secondary Text
        subtle: '#6B6B73',       // Disabled / Subtle Text

        // Accent color alias for easier use
        'accent-red': '#7A0F14',

        // Status Colors
        status: {
          success: '#2E7D32',
          warning: '#B08900',
          error: '#B3261E',
          info: '#1E3A8A',
        },
      },
      backgroundImage: {
        'cinematic-gradient': 'linear-gradient(135deg, #0D0D0F 0%, #1A0F12 40%, #7A0F14 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
