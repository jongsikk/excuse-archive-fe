import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';

function useTheme() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };
  return { isDark, toggle };
}

export default function MyPage() {
  const { token, clearAuth } = useAuthStore();
  const { isDark, toggle } = useTheme();
  const queryClient = useQueryClient();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.getMe(),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: (name: string) => apiClient.updateDisplayName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditingName(false);
    },
  });

  const initials = profile?.displayName
    ? profile.displayName.slice(0, 2).toUpperCase()
    : profile?.email
    ? profile.email.slice(0, 2).toUpperCase()
    : '??';

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-lg font-bold text-text-primary">Account Settings</h1>
        <p className="text-xs text-text-muted mt-0.5">계정 및 환경 설정</p>
      </div>

      {/* 프로필 카드 */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-elevated rounded-lg h-10 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* 아바타 + 이름 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-primary-400">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateMutation.mutate(nameInput);
                        if (e.key === 'Escape') setEditingName(false);
                      }}
                      placeholder="닉네임 입력"
                      className="flex-1 bg-elevated border border-border/60 rounded-xl px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary-400"
                    />
                    <button
                      onClick={() => updateMutation.mutate(nameInput)}
                      disabled={updateMutation.isPending}
                      className="px-3 py-1.5 text-xs bg-primary-500/20 text-primary-400 rounded-lg border border-primary-500/30 hover:bg-primary-500/30 disabled:opacity-50"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary truncate">
                      {profile?.displayName || '닉네임 없음'}
                    </p>
                    <button
                      onClick={() => {
                        setNameInput(profile?.displayName ?? '');
                        setEditingName(true);
                      }}
                      className="text-xs text-text-muted hover:text-text-secondary flex-shrink-0"
                    >
                      수정
                    </button>
                  </div>
                )}
                <p className="text-sm text-text-secondary truncate mt-0.5">{profile?.email ?? '이메일 없음'}</p>
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-elevated rounded-xl p-4 border border-border/50">
                <p className="text-2xl font-bold text-text-primary">{profile?.recordCount ?? 0}</p>
                <p className="text-xs text-text-muted mt-1">총 기록 수</p>
              </div>
              <div className="bg-elevated rounded-xl p-4 border border-border/50">
                <p className="text-sm font-semibold text-text-primary">{joinDate}</p>
                <p className="text-xs text-text-muted mt-1">가입일</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 테마 설정 */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <h2 className="text-sm font-semibold text-text-primary mb-4">테마 설정</h2>
        <div className="flex gap-3">
          {[
            { value: false, label: '라이트 모드', icon: '☀️' },
            { value: true, label: '다크 모드', icon: '🌙' },
          ].map(({ value, label, icon }) => (
            <button
              key={label}
              onClick={() => { if (isDark !== value) toggle(); }}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-colors ${
                isDark === value
                  ? 'bg-primary-500/15 border-primary-500/40 text-primary-400'
                  : 'bg-elevated border-border/60 text-text-secondary hover:border-border'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 계정 */}
      <div className="bg-card rounded-2xl border border-border/60 p-6">
        <h2 className="text-sm font-semibold text-text-primary mb-4">계정</h2>
        <button
          onClick={clearAuth}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:bg-elevated/60 transition-colors border border-transparent hover:border-border/40"
        >
          <span>🚪</span>
          <span>로그아웃</span>
        </button>
      </div>
    </div>
  );
}
