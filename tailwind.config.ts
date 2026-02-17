import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.tsx',
    './src/components/**/*.tsx',
    './src/app/**/*.tsx',
  ],
  theme: {
    extend: {
      colors: {
        'base-charcoal': '#1a1a1a',
        'primary-text': '#f0f0f0',
        'secondary-text': '#a0a0a0',
        'accent-crimson': {
          light: '#c81e1e',
          DEFAULT: '#a01818',
          dark: '#781212',
        },
      },
      backgroundImage: {
        'crimson-gradient': 'linear-gradient(145deg, #a01818, #781212)',
      },
      boxShadow: {
        'ambient-glow': '0 0 40px 10px rgba(160, 24, 24, 0.2)',
      },
    },
  },
  plugins: [],
};
export default config;
