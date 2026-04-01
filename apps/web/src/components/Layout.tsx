import { Outlet, Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-800">
      {/* 사이드바 */}
      <aside className="fixed left-0 top-0 h-screen w-60 bg-dark-700 border-r border-border/70 p-4">
        <div className="mb-8">
          <Link to="/" className="text-xl font-bold text-text-primary">
            변명아카이브
          </Link>
        </div>

        <nav className="space-y-2">
          <Link
            to="/"
            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive('/') && location.pathname === '/'
                ? 'bg-primary-500/20 text-primary-400 border border-border/55'
                : 'text-text-secondary hover:bg-dark-600/35 border border-transparent'
            }`}
          >
            🏠 홈
          </Link>
          <Link
            to="/records"
            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive('/records')
                ? 'bg-primary-500/20 text-primary-400 border border-border/55'
                : 'text-text-secondary hover:bg-dark-600/35 border border-transparent'
            }`}
          >
            📝 기록
          </Link>
          <Link
            to="/report"
            className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive('/report')
                ? 'bg-primary-500/20 text-primary-400 border border-border/55'
                : 'text-text-secondary hover:bg-dark-600/35 border border-transparent'
            }`}
          >
            📊 리포트
          </Link>
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="ml-60 min-h-screen p-6">
        <div className="max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
