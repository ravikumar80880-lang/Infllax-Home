import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        ink:       '#04080f',
        deep:      '#070e1a',
        surface:   '#0b1828',
        card:      '#0f2035',
        cardhi:    '#132540',
        saffron:   '#ff6b1a',
        saffron2:  '#ff8c42',
        teal:      '#00c2a8',
        teal2:     '#00e5c8',
        ivory:     '#f5f0e8',
        fog:       '#7a90a8',
        dim:       '#3d5570',
        line:      'rgba(255,255,255,0.07)',
        linebr:    'rgba(255,255,255,0.12)',
      },
      fontFamily: {
        display: ['var(--font-clash)', 'sans-serif'],
        body:    ['var(--font-satoshi)', 'sans-serif'],
        mono:    ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'hero':   ['clamp(3.2rem, 7.5vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-3px' }],
        'h1':     ['clamp(2.4rem, 5vw, 4.5rem)', { lineHeight: '0.95', letterSpacing: '-2.5px' }],
        'h2':     ['clamp(2rem, 4vw, 3.6rem)',   { lineHeight: '1.0',  letterSpacing: '-2px' }],
        'h3':     ['1.55rem',                     { lineHeight: '1.2',  letterSpacing: '-0.5px' }],
        'lead':   ['clamp(1rem, 1.8vw, 1.2rem)', { lineHeight: '1.75' }],
        'body':   ['0.9rem',                      { lineHeight: '1.75' }],
        'small':  ['0.82rem',                     { lineHeight: '1.6' }],
        'mono':   ['0.68rem',                     { lineHeight: '1.4', letterSpacing: '2px' }],
        'label':  ['0.65rem',                     { lineHeight: '1.4', letterSpacing: '3px' }],
      },
      spacing: {
        'section': '120px',
        'section-sm': '80px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #ff6b1a 0%, #00c2a8 100%)',
        'gradient-saffron': 'linear-gradient(135deg, #ff6b1a, #ff8c42)',
        'gradient-dark': 'linear-gradient(135deg, rgba(255,107,26,0.12) 0%, rgba(0,194,168,0.08) 100%)',
        'grid-lines': "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '72px 72px',
      },
      animation: {
        'ticker':       'ticker 35s linear infinite',
        'blink':        'blink 1.8s ease-in-out infinite',
        'drift-1':      'drift1 12s ease-in-out infinite alternate',
        'drift-2':      'drift2 15s ease-in-out infinite alternate',
        'scroll-pulse': 'scrollpulse 1.6s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'count-up':     'countup 2s ease-out forwards',
      },
      keyframes: {
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.2' },
        },
        drift1: {
          from: { transform: 'translate(0,0)' },
          to:   { transform: 'translate(-60px,40px)' },
        },
        drift2: {
          from: { transform: 'translate(0,0)' },
          to:   { transform: 'translate(50px,-40px)' },
        },
        scrollpulse: {
          '0%,100%': { transform: 'scaleY(1)', opacity: '1' },
          '50%':     { transform: 'scaleY(0.6)', opacity: '0.4' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
      },
      boxShadow: {
        'glow-saffron': '0 16px 48px rgba(255,107,26,0.3)',
        'glow-teal':    '0 16px 48px rgba(0,194,168,0.3)',
        'card':         '0 8px 32px rgba(0,0,0,0.4)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
