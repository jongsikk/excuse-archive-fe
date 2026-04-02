import { Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((d) => !d) };
}

const PAGE_TITLES: Record<string, string> = {
  '/':            'Dashboard',
  '/records':     'My Records',
  '/report':      'Pattern Report',
  '/mypage':      'Account Settings',
  '/records/new': 'Create Entry',
};

const NAV_ITEMS = [
  { path: '/',        label: 'Dashboard',       icon: '◈' },
  { path: '/records', label: 'My Records',      icon: '◇' },
  { path: '/report',  label: 'Pattern Report',  icon: '◉' },
  { path: '/mypage',  label: 'Settings',        icon: '◎' },
];

export default function Layout() {
  const location = useLocation();
  const { isDark, toggle } = useTheme();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-page">

      {/* ── 사이드바 (다크 틸) ── */}
      <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20"
             style={{ backgroundColor: '#2E6863' }}>

        {/* 로고 */}
        <div className="px-8 pt-8 pb-6">
          <Link to="/" className="block">
            <p className="text-lg font-bold tracking-tight" style={{ color: '#E1FFFB' }}>
              Excuse Archive
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(179,238,231,0.6)' }}>
              변명아카이브
            </p>
          </Link>
        </div>

        {/* 구분선 */}
        <div className="mx-6 mb-4" style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        {/* 네비게이션 */}
        <nav className="flex-1 px-4 space-y-0.5">
          {NAV_ITEMS.map(({ path, label, icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={
                  active
                    ? { backgroundColor: 'rgba(255,255,255,0.15)', color: '#E1FFFB' }
                    : { color: 'rgba(179,238,231,0.65)' }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLElement).style.color = '#E1FFFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(179,238,231,0.65)';
                  }
                }}
              >
                <span className="text-base opacity-80">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 하단 — 테마 */}
        <div className="px-4 pb-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(179,238,231,0.65)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.color = '#E1FFFB';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = '';
              (e.currentTarget as HTMLElement).style.color = 'rgba(179,238,231,0.65)';
            }}
          >
            <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* ── 상단 헤더 바 (프로스티드 글래스) ── */}
      <header className="fixed top-0 left-64 right-0 h-16 z-10 flex items-center justify-between px-10 bg-card/80 backdrop-blur-xl border-b border-border/60">
        <p className="text-sm font-semibold text-text-primary tracking-wide">{pageTitle}</p>

        <div className="flex items-center gap-3">
          {/* 검색 인풋 (시각용) */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border"
               style={{ backgroundColor: '#F0F4FA', borderColor: '#E3E9F1', color: '#6B7280' }}>
            <span className="text-xs">🔍</span>
            <span>기록 검색...</span>
          </div>

          {/* Create Entry 버튼 */}
          <Link
            to="/records/new"
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#2E6863', color: '#E1FFFB' }}
          >
            + Create Entry
          </Link>
        </div>
      </header>

      {/* ── 메인 콘텐츠 ── */}
      <main className="ml-64 min-h-screen pt-16">
        <div className="p-8 max-w-5xl">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
