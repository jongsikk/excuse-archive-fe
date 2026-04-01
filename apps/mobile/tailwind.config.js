/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // 배경색
        dark: {
          900: '#1E1E1E',
          800: '#202631',
          700: '#2B3340',
          600: '#343C47',
        },
        // 테두리/구분선
        border: {
          DEFAULT: '#4B5563',
        },
        // 포인트 색상 (민트)
        primary: {
          50: '#E6FAF8',
          100: '#CCF5F1',
          200: '#99EBE3',
          300: '#66E0D5',
          400: '#55D2C6',
          500: '#55D2C6',
          600: '#44A89E',
          700: '#337E77',
          800: '#22544F',
          900: '#112A28',
        },
        // 경고/강조 (주황)
        accent: {
          DEFAULT: '#B07A3E',
        },
        // 텍스트
        text: {
          primary: '#EAF0FA',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
      },
    },
  },
  plugins: [],
};
