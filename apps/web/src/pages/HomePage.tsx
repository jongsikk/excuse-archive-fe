import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import {
  MISTAKE_TYPE_LABELS,
  EMOTION_LABELS,
  calculateStreak,
  calculateWeeklySummary,
  calculateCalendarHeatmap,
} from '@excuse-archive/shared';
import type { Record } from '@excuse-archive/shared';

type HV = { date?: string; count?: number; avgIntensity?: number } | null | undefined;

function ActivityHeatmap({ records }: { records: Record[] }) {
  const cells = calculateCalendarHeatmap(records, 112);
  const today = new Date().toISOString().split('T')[0];

  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 111);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const classForValue = (value: any): string => {
    const v = value as HV;
    const base = (() => {
      if (!v || !v.count) return 'color-empty';
      if (!v.avgIntensity) return 'color-mint';
      if (v.avgIntensity <= 2) return 'color-scale-1';
      if (v.avgIntensity <= 3) return 'color-scale-3';
      if (v.avgIntensity <= 4) return 'color-scale-4';
      return 'color-scale-5';
    })();
    return v?.date === today ? `${base} today` : base;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const titleForValue = (value: any): string => {
    const v = value as HV;
    return v?.count ? `${v.date} · ${v.count}건 (강도 ${v.avgIntensity})` : (v?.date ?? '');
  };

  return (
    <div className="bg-card rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Activity Heatmap</h2>
          <p className="text-xs text-text-muted mt-0.5">최근 16주 기록 빈도 분석</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>적음</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-elevated border border-border/40" />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'rgba(13,148,136,0.35)' }} />
            <div className="w-3 h-3 rounded-sm bg-[#4ade80]" />
            <div className="w-3 h-3 rounded-sm bg-[#facc15]" />
            <div className="w-3 h-3 rounded-sm bg-[#fb923c]" />
          </div>
          <span>많음</span>
        </div>
      </div>

      <ReactCalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={cells}
        classForValue={classForValue}
        titleForValue={titleForValue}
        gutterSize={3}
        showMonthLabels
        showWeekdayLabels={false}
      />
    </div>
  );
}

function RecordCard({ record }: { record: Record }) {
  const timeAgo = (() => {
    const diff = Date.now() - new Date(record.occurredAt).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return '방금';
    if (h < 24) return `${h}H AGO`;
    const d = Math.floor(h / 24);
    if (d === 1) return 'YESTERDAY';
    return `${d}D AGO`;
  })();

  const typeLabel = record.mistakeType
    ? MISTAKE_TYPE_LABELS[record.mistakeType]
    : record.emotion
    ? EMOTION_LABELS[record.emotion]
    : '기타';

  return (
    <Link
      to={`/records/${record.id}`}
      className="flex items-start gap-4 p-4 rounded-xl border border-border/60 hover:border-primary-500/40 transition-colors group"
      style={{ backgroundColor: '#F7F9FE' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold tracking-widest uppercase text-text-muted">{typeLabel}</span>
          <span className="text-xs text-text-muted">{timeAgo}</span>
        </div>
        <p className="text-sm font-semibold text-text-primary line-clamp-1">{record.situation}</p>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-1 leading-relaxed">{record.myAction}</p>
      </div>
      {record.nextActionDone && (
        <span className="mt-1 px-2 py-0.5 text-xs rounded-full flex-shrink-0 font-medium"
              style={{ backgroundColor: 'rgba(46,104,99,0.12)', color: '#2E6863' }}>
          완료
        </span>
      )}
    </Link>
  );
}

export default function HomePage() {
  const { token, isLoading: authLoading } = useAuthStore();

  const { data: allData, isLoading } = useQuery({
    queryKey: ['records', 'all-for-home'],
    queryFn: () => apiClient.getRecords(0, 200),
    enabled: !!token,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted text-sm">인증 중...</div>
      </div>
    );
  }

  const allRecords = allData?.content ?? [];
  const recentRecords = allRecords.slice(0, 3);
  const streak = calculateStreak(allRecords);
  const summary = calculateWeeklySummary(allRecords);
  const pendingCount = allRecords.filter((r) => !r.nextActionDone).length;

  return (
    <div className="space-y-6">

      {/* ── 인삿말 ── */}
      <section className="py-2">
        <h1 className="text-2xl font-bold text-text-primary">
          안녕하세요 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {pendingCount > 0
            ? `미완료 행동이 ${pendingCount}개 남아있습니다. 오늘도 기록해봐요.`
            : '오늘도 좋은 하루를 보내고 계신가요? 새로운 기록을 남겨보세요.'}
        </p>
      </section>

      {/* ── 스트릭 + 주간 요약 (2열) ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* 스트릭 카드 (다크 틸) */}
        <div className="rounded-2xl p-6 relative overflow-hidden"
             style={{ backgroundColor: '#2E6863' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
             style={{ color: 'rgba(179,238,231,0.8)' }}>
            Current Streak
          </p>
          <p className="text-5xl font-bold mb-1" style={{ color: '#E1FFFB' }}>
            {streak}
          </p>
          <p className="text-sm" style={{ color: 'rgba(179,238,231,0.7)' }}>
            Days of Consistent Archiving
          </p>
          {streak > 0 && (
            <p className="text-xs mt-3" style={{ color: 'rgba(179,238,231,0.55)' }}>
              내일도 기록하면 {streak + 1}일 달성!
            </p>
          )}
          {/* 장식 원 */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full opacity-10"
               style={{ backgroundColor: '#E1FFFB' }} />
          <div className="absolute -right-2 -bottom-10 w-20 h-20 rounded-full opacity-10"
               style={{ backgroundColor: '#E1FFFB' }} />
        </div>

        {/* 주간 요약 카드 */}
        <div className="bg-card rounded-2xl border border-border/60 p-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-text-muted mb-4">
            Weekly Archive Load
          </p>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="bg-elevated rounded-lg h-8 animate-pulse" />)}
            </div>
          ) : summary.total > 0 ? (
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-text-primary">{summary.total}</span>
                <span className="text-sm text-text-muted mb-1">건 기록</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-elevated rounded-xl p-3 border border-border/50">
                  <p className="text-lg font-bold" style={{ color: '#0D9488' }}>{summary.completionRate}%</p>
                  <p className="text-xs text-text-muted mt-0.5">완료율</p>
                </div>
                <div className="bg-elevated rounded-xl p-3 border border-border/50">
                  <p className="text-lg font-bold text-text-primary">{summary.completed}</p>
                  <p className="text-xs text-text-muted mt-0.5">완료 행동</p>
                </div>
              </div>
              {summary.topTypeLabel && (
                <p className="text-xs text-text-muted pt-1">
                  주요 유형: <span className="text-text-secondary font-medium">{summary.topTypeLabel}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24">
              <p className="text-text-muted text-sm">이번 주 기록 없음</p>
              <Link to="/records/new" className="text-xs mt-2 font-medium"
                    style={{ color: '#0D9488' }}>
                첫 기록 작성하기 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── 미완료 배너 ── */}
      {pendingCount > 0 && (
        <Link
          to="/records?filter=pending"
          className="flex items-center justify-between rounded-2xl px-5 py-4 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <div className="flex items-center gap-4">
            <span className="text-xl">📌</span>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#3B82F6' }}>
                미완료 행동 {pendingCount}개
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(59,130,246,0.7)' }}>
                다음 행동을 확인해보세요
              </p>
            </div>
          </div>
          <span style={{ color: '#3B82F6' }}>→</span>
        </Link>
      )}

      {/* ── Activity Heatmap ── */}
      {!isLoading && <ActivityHeatmap records={allRecords} />}

      {/* ── Recent Submissions ── */}
      <section className="bg-card rounded-2xl border border-border/60 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Recent Submissions</h2>
            <p className="text-xs text-text-muted mt-0.5">최근 기록 목록</p>
          </div>
          <Link to="/records" className="text-xs font-semibold tracking-wide"
                style={{ color: '#0D9488' }}>
            View Full Archive →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-elevated rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : recentRecords.length === 0 ? (
          <div className="text-center py-12 bg-elevated rounded-xl border border-border/50">
            <p className="text-text-secondary text-sm mb-3">아직 기록이 없습니다</p>
            <Link to="/records/new" className="text-sm font-semibold"
                  style={{ color: '#0D9488' }}>
              첫 기록 작성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>

      {/* ── 패턴 분석 링크 ── */}
      <Link
        to="/report"
        className="flex items-center justify-between bg-card rounded-2xl border border-border/60 p-6 hover:border-primary-500/40 transition-colors"
      >
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">Curator's Weekly Insight</p>
          <p className="text-text-secondary text-xs leading-relaxed">
            최근 기록의 실수 유형, 감정 패턴, 트리거를 분석해보세요
          </p>
        </div>
        <span className="text-text-muted ml-4">→</span>
      </Link>

    </div>
  );
}
