import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS, calculateIntensityTrend } from '@excuse-archive/shared';
import type { PatternItem } from '@excuse-archive/shared';

function PatternBar({ item, maxCount, color }: { item: PatternItem; maxCount: number; color: string }) {
  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-sm text-text-secondary truncate">{item.key}</div>
      <div className="flex-1 bg-dark-600 rounded-full h-5 overflow-hidden border border-border/60">
        <div
          className={`h-full ${color} transition-all duration-700 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="w-8 text-sm text-text-secondary text-right font-medium">{item.count}</div>
    </div>
  );
}

function PatternSection({
  title,
  items,
  labelMap,
  color,
  emptyText,
}: {
  title: string;
  items: PatternItem[];
  labelMap?: Record<string, string>;
  color: string;
  emptyText: string;
}) {
  const maxCount = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 0;
  const displayItems = items.map((item) => ({
    ...item,
    key: labelMap?.[item.key as keyof typeof labelMap] || item.key,
  }));

  return (
    <div className="bg-dark-600 rounded-xl border border-border/75 p-4">
      <h3 className="font-semibold text-text-primary mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-text-muted text-sm">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item, index) => (
            <PatternBar key={index} item={item} maxCount={maxCount} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

function IntensityTrendChart({ days, trend }: { days: number; trend: { label: string; avg: number }[] }) {
  const hasData = trend.some((r) => r.avg > 0);
  const displayTrend = days === 7 ? trend : trend.filter((_, i) => i % 5 === 0 || i === trend.length - 1);

  const maxVal = 5;
  const chartH = 100;

  // SVG 라인 포인트 계산
  const points = displayTrend
    .map((item, i) => {
      const x = displayTrend.length > 1 ? (i / (displayTrend.length - 1)) * 100 : 50;
      const y = item.avg > 0 ? chartH - (item.avg / maxVal) * chartH : null;
      return { x, y, avg: item.avg };
    });

  const linePoints = points.filter((p) => p.y !== null);
  const polyline =
    linePoints.length > 1
      ? linePoints.map((p) => `${p.x},${p.y}`).join(' ')
      : '';

  const barColor = (avg: number) =>
    avg > 3 ? 'bg-red-500' : avg > 2 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="bg-dark-600 rounded-xl border border-border/75 p-4">
      <h3 className="font-semibold text-text-primary mb-1">감정 강도 추이</h3>
      <p className="text-xs text-text-muted mb-5">일별 평균 강도 (1~5)</p>

      {!hasData ? (
        <p className="text-text-muted text-sm">강도 데이터가 없습니다</p>
      ) : (
        <>
          {/* 바 + 라인 오버레이 차트 */}
          <div className="relative h-32 mb-2">
            {/* 바 차트 */}
            <div className="flex items-end gap-1 h-full">
              {displayTrend.map((item, i) => {
                const heightPct = item.avg > 0 ? (item.avg / maxVal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    {item.avg > 0 && (
                      <span className="text-[10px] text-text-muted mb-1">{item.avg}</span>
                    )}
                    <div
                      className={`w-full rounded-t ${barColor(item.avg)} opacity-60 transition-all duration-500`}
                      style={{ height: `${Math.max(heightPct, item.avg > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* SVG 라인 오버레이 */}
            {linePoints.length > 1 && (
              <svg
                className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
                viewBox={`0 0 100 ${chartH}`}
                preserveAspectRatio="none"
              >
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="#55D2C6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
                {linePoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y!}
                    r="2.5"
                    fill="#55D2C6"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
            )}
          </div>

          {/* X축 레이블 */}
          <div className="flex gap-1">
            {displayTrend.map((item, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-xs text-text-muted">{item.label}</span>
              </div>
            ))}
          </div>

          {/* 범례 */}
          <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-border/50">
            {[
              { color: 'bg-emerald-500', label: '낮음 (1~2)' },
              { color: 'bg-yellow-500', label: '보통 (3)' },
              { color: 'bg-red-500', label: '높음 (4~5)' },
              { color: 'bg-primary-500', label: '추이선', isLine: true },
            ].map(({ color, label, isLine }) => (
              <div key={label} className="flex items-center gap-1.5">
                {isLine ? (
                  <div className="w-5 h-0.5 bg-primary-500 rounded" />
                ) : (
                  <div className={`w-3 h-3 rounded ${color} opacity-60`} />
                )}
                <span className="text-xs text-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportPage() {
  const { token } = useAuthStore();
  const [days, setDays] = useState<7 | 30>(7);

  const { data, isLoading } = useQuery({
    queryKey: ['report', days],
    queryFn: () => apiClient.getPatternReport(days),
    enabled: !!token,
  });

  const { data: recordsData } = useQuery({
    queryKey: ['records', 'all-for-report'],
    queryFn: () => apiClient.getRecords(0, 200),
    enabled: !!token,
  });

  const intensityTrend = calculateIntensityTrend(recordsData?.content ?? [], days);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">패턴 리포트</h1>
        <div className="flex bg-dark-600 rounded-full p-1 border border-border/70">
          <button
            onClick={() => setDays(7)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              days === 7
                ? 'bg-primary-500/22 text-primary-400 border border-border/70'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            7일
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              days === 30
                ? 'bg-primary-500/22 text-primary-400 border border-border/70'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            30일
          </button>
        </div>
      </div>

      <div className="bg-dark-700 rounded-2xl border border-border/70 p-6">
        {data && (
          <p className="text-sm text-text-muted mb-6">
            {new Date(data.since).toLocaleDateString('ko-KR')} ~{' '}
            {new Date(data.generatedAt).toLocaleDateString('ko-KR')} 기준
          </p>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-dark-600 rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="space-y-4">
            <PatternSection
              title="Top 3 실수 유형"
              items={data.topMistakeTypes}
              labelMap={MISTAKE_TYPE_LABELS}
              color="bg-primary-500"
              emptyText="데이터가 없습니다"
            />
            <PatternSection
              title="Top 3 감정"
              items={data.topEmotions}
              labelMap={EMOTION_LABELS}
              color="bg-purple-500"
              emptyText="데이터가 없습니다"
            />
            <PatternSection
              title="Top 3 트리거"
              items={data.topTriggers}
              color="bg-accent"
              emptyText="데이터가 없습니다"
            />
            <IntensityTrendChart days={days} trend={intensityTrend} />
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-secondary">리포트를 불러올 수 없습니다</p>
          </div>
        )}
      </div>

      <div className="bg-dark-600 rounded-xl border border-border/75 p-4 text-sm text-text-secondary">
        <p className="font-medium text-text-primary mb-2">패턴 리포트란?</p>
        <p>
          최근 기록을 분석해서 자주 발생하는 실수 유형, 그때의 감정, 트리거 상황을 보여줍니다. 이
          패턴을 인식하면 같은 실수를 반복하지 않는 데 도움이 됩니다.
        </p>
      </div>
    </div>
  );
}
