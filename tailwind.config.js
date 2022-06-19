const plugin = require('tailwindcss/plugin');

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  purge: [
    './public/**/*.html',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'media',
  theme: {
    colors: {
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',
      primary: {
        'blue-1': '#2076D2',
        'blue-2': '#87B5E7',
        'blue-3': '#E8F3FF',
      },
      secondary: {
        'gray-1': '#525E62',
        'gray-2': '#A2A8AA',
        'gray-3': '#BBC1C3',
        'gray-4': '#EAECEC',
      },
      tertiary: {
        wisteria: '#C0ABD8',
        'light-sky-blue': '#89CCF7',
        pistachio: '#A7D676',
        caramel: '#FFE09B',
        'vivid-tangerine': '#FEA695',
        tulip: '#F48A89',
        'amaranth-pink': '#F3ABB6',
        'silver-pink': '#C8A6A7',
      },
      sky: '#15C1EE',
      blue: {
        light: '#E8F3FF',
        DEFAULT: '#2076D2',
        dark: {
          DEFAULT: '#00205C',
          op50: 'rgba(0,32,92,.5)',
        },
      },
      bluesky: 'linear-gradient(90deg, #2076D2 0%, #15C1EE 100%)',
      gray: {
        dark: {
          DEFAULT: '#BFC7D6',
          opa50: 'rgba(191,199,214,.4)',
        },
        DEFAULT: '#525E62',
        light: '#ECEEF3',
        tab: '#808080',
        opa12: 'rgba(82, 94, 98, 0.12)',
        opa54: 'rgba(82, 94, 98, 0.54)',
      },
      black: {
        opa80: 'rgba(0, 0, 0, 0.8)',
      },
      'deep-blue': '#7F8FAD',
      success: '#6FCF97',
      warning: '#F5CB14',
      danger: '#F5003B',
    },
    fontSize: {
      h1: ['2.441rem', '2.875rem'],
      h2: ['1.953rem', '2.312rem'],
      h3: ['1.563rem', '1.812rem'],
      h4: ['1.25rem', '1.437rem'],
      h5: ['0.8rem', '0.937rem'],
      h6: ['0.64rem', '0.75rem'],
      p: ['1rem', '1.187rem'],
      xl: ['3.052rem', '3.562rem'],
      '2xl': ['3.815rem', '4.5rem'],
      '3xl': ['4.768rem', '5.562rem'],
    },
    extend: {
      boxShadow: {
        nav: '5px 0px 10px rgba(82, 94, 98, 0.15)',
      },
      backgroundImage: {
        'login-logo': "url('/static/images/Icon/logoconnectx.png')"
      },
    },
    screens: {
      ...defaultTheme.screens,
      mobile: [{ max: '320px' }, { max: '375px' }, { max: '425px' }],
      tablet: { max: '768px' },
      laptop: [{ max: '1024px' }, { max: '1440px' }],
      desktop: { max: '2560px' },
    },
    boxShadow: {
      nav: '0px 1px 0px rgba(82, 94, 98, 0.12), 0px 4px 18px rgba(0, 0, 0, 0.08)',
    }
  },
  variants: {
    extend: {
      backgroundColor: ['focus-visible', 'active', 'group-focus'],
      textColor: ['focus-visible', 'active', 'group-focus'],
    },
  },
  plugins: [
    plugin(({ addUtilities, theme }) => {
      const newUtilities = {
        '.btn-primary': {
          color: '#FFF',
          background: theme('colors.blue.DEFAULT'),
        },
        '.btn-default': {
          color: theme('colors.blue.DEFAULT'),
          background: theme('colors.blue.light'),
        },
        '.btn-primary-outline': {
          color: theme('colors.blue.DEFAULT'),
          border: `1px solid ${theme('colors.blue.DEFAULT')}`,
          background: '#FFF',
        },
        '.btn-default-outline': {
          color: theme('colors.blue.dark.op50'),
          border: `1px solid ${theme('colors.blue.dark.op50')}`,
          background: '#FFF',
        },
        '.disable-primary': {
          border: `1px solid ${theme('colors.gray.dark.DEFAULT')}`,
          background: theme('colors.gray.light'),
          color: theme('colors.gray.dark.DEFAULT'),
          cursor: 'not-allowed',
        },
        '.disable-outline': {
          border: `1px solid ${theme('colors.gray.dark.DEFAULT')}`,
          background: '#FFF',
          color: theme('colors.gray.dark.DEFAULT'),
          cursor: 'not-allowed',
        },
        '.btn-sm': {
          width: '8.75rem',
          fontWeight: 400,
        },
        '.btn-md': {
          width: '12.5rem',
          fontWeight: 700,
        },
        '.btn-lg': {
          width: '18.25rem',
          fontWeight: 700,
        },
        '.btn-block': {
          padding: '0 20px',
        },
        '.input-sm': {
          width: '10.625rem',
        },
        '.input-md': {
          width: '18.25rem',
        },
        '.img-sm': {
          width: '2rem',
          height: '2rem',
        },
        '.img-md': {
          width: '3.125rem',
          height: '3.125rem',
        },
        '.full': {
          width: '100%',
        },
      };
      addUtilities(newUtilities);
    }),
  ],
  zIndex: {
    extend: {
      'z-full': 999,
    },
  },
};