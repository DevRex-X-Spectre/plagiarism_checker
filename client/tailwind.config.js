/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'paper-white': '#f6f6f8',
        'card-white': '#ffffff',
        'deep-ink': '#011821',
        carbon: '#12161e',
        slate: '#7c7f88',
        mist: '#e3e4e8',
        fog: '#a9acb6',
        graphite: '#3b3e47',
        'deep-indigo': '#111a4a',
        'ember-orange': '#ec652b',
        'midnight-teal': '#023247',
        'forest-teal': '#167e6c',
        'sky-blue': '#7ea7e9',
        'pale-cyan': '#c1e8ef',
        mint: '#44b48b',
        lavender: '#9f7aee',
        danger: '#dc2626',
        'danger-light': '#fee2e2',
        warning: '#d97706',
        'warning-light': '#fef3c7',
        success: '#059669',
        'success-light': '#d1fae5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgba(17, 26, 74, 0.08)',
        md: '0 4px 12px -2px rgba(17, 26, 74, 0.08)',
        lg: '0 12px 24px -6px rgba(17, 26, 74, 0.10)',
        xl: '0 24px 48px -8px rgba(17, 26, 74, 0.14)',
      },
      borderRadius: {
        badges: '9999px',
      },
    },
  },
  plugins: [],
};