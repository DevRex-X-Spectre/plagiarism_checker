/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'paper-white': '#ecf9fb',
        'card-white': '#f5f6f8',
        'deep-ink': '#10142f',
        carbon: '#212156',
        slate: '#676792',
        mist: '#cbd3f7',
        fog: '#abb1d9',
        graphite: '#4d4e74',
        'deep-indigo': '#212156',
        'ember-orange': '#f17ce8',
        'midnight-teal': '#0b102e',
        'forest-teal': '#6d5fcd',
        'sky-blue': '#609ed9',
        'pale-cyan': '#ecf9fb',
        mint: '#65d5ed',
        lavender: '#a2a2db',
        danger: '#b04fdc',
        'danger-light': '#eadfff',
        warning: '#8e6c5d',
        'warning-light': '#f1e8ff',
        success: '#609ed9',
        'success-light': '#e2f7fb',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgba(33, 33, 86, 0.10)',
        md: '0 4px 12px -2px rgba(33, 33, 86, 0.12)',
        lg: '0 12px 24px -6px rgba(33, 33, 86, 0.16)',
        xl: '0 24px 48px -8px rgba(33, 33, 86, 0.20)',
      },
      borderRadius: {
        badges: '9999px',
      },
    },
  },
  plugins: [],
};
