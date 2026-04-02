/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // ─── 시맨틱 테마 토큰 ───
        page:     'rgb(var(--bg-page)     / <alpha-value>)',
        card:     'rgb(var(--bg-card)     / <alpha-value>)',
        elevated: 'rgb(var(--bg-elevated) / <alpha-value>)',
        overlay:  'rgb(var(--bg-overlay)  / <alpha-value>)',

        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
        },

        text: {
          primary:   'rgb(var(--text-primary)   / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted:     'rgb(var(--text-muted)     / <alpha-value>)',
        },

        // ─── 포인트 (다크 틸) — Figma #2E6863 ───
        primary: {
          50:  '#EEF8F7',
          100: '#E1FFFB', // 다크 틸 배경 위 텍스트
          200: '#B3EEE7', // 다크 틸 배경 위 서브 텍스트
          300: '#76AFA9',
          400: '#0D9488', // 라이트 배경 위 링크/강조 텍스트
          500: '#2E6863', // 메인 다크 틸
          600: '#205C57',
          700: '#1F5B56',
          800: '#115E59',
          900: '#0A3330',
        },

        // ─── 경고/강조 ───
        accent: {
          DEFAULT: '#B07A3E',
          light: 'rgba(176, 122, 62, 0.35)',
        },

        // ─── 레거시 ───
        dark: {
          900: '#1E1E1E',
          800: '#202631',
          700: '#2B3340',
          600: '#343C47',
        },
      },
      borderRadius: {
        xl:  '14px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
