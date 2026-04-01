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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HV = { date?: string; count?: number; avgIntensity?: number } | null | undefined;

function CalendarHeatmap({ records }: { records: Record[] }) {
  const cells = calculateCalendarHeatmap(records, 112); // 16주
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
    return v?.count
      ? `${v.date} · ${v.count}건 (강도 ${v.avgIntensity})`
      : (v?.date ?? '');
  };

  return (
    <div className="bg-dark-700 rounded-2xl border border-border/70 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">기록 히트맵</h2>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>적음</span>
          <div className="flex items-center gap-0.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-[#2B3340]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#4ade80]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#facc15]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#fb923c]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#f87171]" />
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
        gutterSize={2}
        showMonthLabels
        showWeekdayLabels={false}
      />

      <p className="text-xs text-text-muted mt-1">최근 16주 기록 현황</p>
    </div>
  );
}

function RecordCard({ record }: { record: Record }) {
  return (
    <Link
      to={`/records/${record.id}`}
      className="block bg-dark-700 rounded-2xl border border-border/70 p-4 hover:border-primary-500/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-primary font-medium line-clamp-2">{record.situation}</p>
          <p className="text-text-secondary text-sm mt-1 line-clamp-1">{record.myAction}</p>
        </div>
        {record.nextActionDone && (
          <span className="ml-2 px-2 py-1 bg-primary-500/25 text-primary-400 text-xs rounded-full border border-border/70 flex-shrink-0">
            완료
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted flex-wrap">
        {record.mistakeType && (
          <span className="px-2 py-0.5 bg-dark-600 rounded border border-border/55">
            {MISTAKE_TYPE_LABELS[record.mistakeType]}
          </span>
        )}
        {record.emotion && (
          <span className="px-2 py-0.5 bg-dark-600 rounded border border-border/55">
            {EMOTION_LABELS[record.emotion]}
          </span>
        )}
        <span className="ml-auto text-text-secondary">
          {new Date(record.occurredAt).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
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
        <div className="text-text-secondary">인증 중...</div>
      </div>
    );
  }

  const allRecords = allData?.content ?? [];
  const recentRecords = allRecords.slice(0, 3);
  const streak = calculateStreak(allRecords);
  const summary = calculateWeeklySummary(allRecords);
  const pendingCount = allRecords.filter((r) => !r.nextActionDone).length;

  return (
    <div className="space-y-5">
      <section className="py-4">
        <h1 className="text-3xl font-bold text-text-primary mb-1">변명아카이브</h1>
        <p className="text-text-secondary text-sm">비난 대신 관찰, 후회를 성장으로</p>
      </section>

      {/* 스트릭 + 미완료 배너 */}
      <div className="space-y-3">
        {streak > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl px-5 py-4 flex items-center gap-4">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-semibold text-orange-400">{streak}일 연속 기록 중</p>
              <p className="text-orange-400/70 text-sm mt-0.5">오늘도 기록하면 {streak + 1}일!</p>
            </div>
          </div>
        )}

        {pendingCount > 0 && (
          <Link
            to="/records?filter=pending"
            className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 rounded-2xl px-5 py-4 hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">📌</span>
              <div>
                <p className="font-semibold text-blue-400">아직 못 한 것들 {pendingCount}개</p>
                <p className="text-blue-400/70 text-sm mt-0.5">다음 행동을 확인해보세요</p>
              </div>
            </div>
            <span className="text-blue-400">→</span>
          </Link>
        )}
      </div>

      {/* 새 기록 버튼 */}
      <Link
        to="/records/new"
        className="block w-full bg-primary-500/20 text-primary-400 text-center py-4 rounded-xl font-medium border border-primary-500/50 hover:bg-primary-500/30 transition-colors"
      >
        + 새 기록 작성하기
      </Link>

      {/* 캘린더 히트맵 */}
      {!isLoading && <CalendarHeatmap records={allRecords} />}

      {/* 주간 요약 */}
      {!isLoading && summary.total > 0 && (
        <section className="bg-dark-700 rounded-2xl border border-border/70 p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">지난 7일 요약</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-text-primary">{summary.total}</p>
              <p className="text-xs text-text-muted mt-1">총 기록</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-400">{summary.completionRate}%</p>
              <p className="text-xs text-text-muted mt-1">완료율</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{summary.completed}</p>
              <p className="text-xs text-text-muted mt-1">완료한 행동</p>
            </div>
          </div>
          {summary.topTypeLabel && (
            <p className="mt-4 pt-4 border-t border-border/50 text-sm text-text-muted">
              가장 많이 반복된 유형:{' '}
              <span className="text-text-secondary font-medium">{summary.topTypeLabel}</span>
            </p>
          )}
        </section>
      )}

      {/* 최근 기록 */}
      <section className="bg-dark-700 rounded-2xl border border-border/70 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">최근 기록</h2>
          <Link to="/records" className="text-sm text-primary-400 hover:text-primary-300">
            전체보기 →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-600 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : recentRecords.length === 0 ? (
          <div className="text-center py-12 bg-dark-600 rounded-xl border border-border/55">
            <p className="text-text-secondary mb-4">아직 기록이 없습니다</p>
            <Link to="/records/new" className="text-primary-400 hover:text-primary-300 font-medium">
              첫 기록 작성하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>
        )}
      </section>

      {/* 패턴 분석 링크 */}
      <Link
        to="/report"
        className="block bg-dark-700 rounded-2xl border border-border/70 p-6 hover:border-primary-500/50 transition-colors"
      >
        <h3 className="font-semibold text-text-primary mb-1">📊 나의 패턴 분석</h3>
        <p className="text-text-secondary text-sm">
          최근 7일/30일 동안의 실수 유형, 감정, 트리거를 확인해보세요
        </p>
      </Link>
    </div>
  );
}
