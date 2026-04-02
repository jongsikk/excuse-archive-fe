import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

type Tab = 'login' | 'register';

const ACCENT = '#55D2C6';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoading, error } = useAuthStore();

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch {
      // error는 store에 저장됨
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (password !== passwordConfirm) {
      setLocalError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (password.length < 8) {
      setLocalError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    try {
      await register(email, password, displayName || undefined);
      navigate('/', { replace: true });
    } catch {
      // error는 store에 저장됨
    }
  };

  const shownError = localError || error;

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-1">변명아카이브</h1>
          <p className="text-text-muted text-sm">비난 대신 관찰, 후회를 성장으로</p>
        </div>

        {/* 탭 */}
        <div className="flex bg-card rounded-xl p-1 mb-6 border border-border/60">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setLocalError(''); }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: tab === t ? ACCENT + '20' : 'transparent',
                color: tab === t ? ACCENT : '#9CA3AF',
                borderWidth: tab === t ? 1 : 0,
                borderColor: ACCENT + '60',
              }}
            >
              {t === 'login' ? '로그인' : '회원가입'}
            </button>
          ))}
        </div>

        {/* 폼 */}
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="hello@example.com" />
              <Field label="비밀번호" type="password" value={password} onChange={setPassword} placeholder="비밀번호 입력" />

              {shownError && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {shownError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
                style={{ backgroundColor: ACCENT, color: '#202631' }}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="hello@example.com" />
              <Field label="닉네임 (선택)" type="text" value={displayName} onChange={setDisplayName} placeholder="표시될 이름" />
              <Field label="비밀번호" type="password" value={password} onChange={setPassword} placeholder="8자 이상" />
              <Field label="비밀번호 확인" type="password" value={passwordConfirm} onChange={setPasswordConfirm} placeholder="비밀번호 재입력" />

              {shownError && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {shownError}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
                style={{ backgroundColor: ACCENT, color: '#202631' }}
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          실수와 후회를 솔직하게 기록하는 공간입니다
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-elevated border border-border/60 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-400 transition-colors"
      />
    </div>
  );
}
