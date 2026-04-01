import type { Record } from '../types';
import { MISTAKE_TYPE_LABELS } from '../types';

function toDateStr(isoStr: string): string {
  return new Date(isoStr).toISOString().split('T')[0];
}

export function calculateStreak(records: Record[]): number {
  if (records.length === 0) return 0;

  const recordDates = new Set(records.map((r) => toDateStr(r.occurredAt)));

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const startDate = recordDates.has(today)
    ? today
    : recordDates.has(yesterday)
      ? yesterday
      : null;

  if (!startDate) return 0;

  let streak = 0;
  const current = new Date(startDate + 'T00:00:00Z');

  while (true) {
    const dateStr = current.toISOString().split('T')[0];
    if (recordDates.has(dateStr)) {
      streak++;
      current.setUTCDate(current.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateWeeklySummary(records: Record[]) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekRecords = records.filter((r) => new Date(r.occurredAt) >= weekAgo);

  const total = weekRecords.length;
  const completed = weekRecords.filter((r) => r.nextActionDone).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const typeCounts: { [key: string]: number | undefined } = {};
  weekRecords.forEach((r) => {
    if (r.mistakeType) {
      typeCounts[r.mistakeType] = (typeCounts[r.mistakeType] ?? 0) + 1;
    }
  });

  const topType = Object.entries(typeCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0];
  const topTypeLabel = topType
    ? MISTAKE_TYPE_LABELS[topType as keyof typeof MISTAKE_TYPE_LABELS]
    : null;

  return { total, completed, completionRate, topTypeLabel };
}

export function calculateCalendarHeatmap(records: Record[], days = 84) {
  const result: { date: string; avgIntensity: number; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayRecords = records.filter((r) => toDateStr(r.occurredAt) === dateStr);
    const intensityRecords = dayRecords.filter((r) => r.intensityLevel != null);

    const avgIntensity =
      intensityRecords.length > 0
        ? intensityRecords.reduce((sum, r) => sum + (r.intensityLevel ?? 0), 0) /
          intensityRecords.length
        : 0;

    result.push({
      date: dateStr,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      count: dayRecords.length,
    });
  }

  return result;
}

export function calculateIntensityTrend(records: Record[], days: number) {
  const result: { label: string; avg: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;

    const dayRecords = records.filter(
      (r) => r.intensityLevel != null && toDateStr(r.occurredAt) === dateStr
    );

    const avg =
      dayRecords.length > 0
        ? dayRecords.reduce((sum, r) => sum + (r.intensityLevel ?? 0), 0) / dayRecords.length
        : 0;

    result.push({ label, avg: Math.round(avg * 10) / 10 });
  }

  return result;
}
