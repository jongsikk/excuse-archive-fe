import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { Record } from '@excuse-archive/shared';
import { calculateStreak, calculateCalendarHeatmap } from '../../lib/insights';
import { useTheme } from '../../hooks/useTheme';

// 4×7 heatmap (28일)
function heatmapColor(count: number, avgIntensity: number, emptyColor: string): string {
  if (count === 0) return emptyColor;
  if (avgIntensity <= 2) return '#cce8e4';
  if (avgIntensity <= 3.5) return '#b3eee7';
  return '#2e6863';
}

function ActivityHeatmap({ records }: { records: Record[] }) {
  const c = useTheme();
  const cells = calculateCalendarHeatmap(records, 28);
  const today = new Date().toISOString().split('T')[0];

  // 7 cols × 4 rows
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const todayCount = cells.find((c) => c.date === today)?.count ?? 0;
  const allCategories = records.flatMap((r) => r.mistakeType ? [r.mistakeType] : []);
  const categoryCounts: { [key: string]: number } = {};
  allCategories.forEach((cat) => { categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1; });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const topCategoryLabel = topCategory ? MISTAKE_TYPE_LABELS[topCategory[0] as keyof typeof MISTAKE_TYPE_LABELS] : null;

  return (
    <View style={{ backgroundColor: c.card, borderRadius: 8, padding: 32, marginBottom: 32, ...c.shadowMd }}>
      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: c.textPrimary, marginBottom: 24 }}>
        Activity Heatmap
      </Text>

      {/* 7-col × 4-row grid */}
      <View style={{ flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        {weeks.map((week, wi) => (
          <View key={wi} style={{ flexDirection: 'row', gap: 6 }}>
            {week.map((cell, di) => (
              <View
                key={di}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 4,
                  backgroundColor: heatmapColor(cell.count, cell.avgIntensity, c.section),
                  borderWidth: cell.date === today ? 1.5 : 0,
                  borderColor: '#2e6863',
                }}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Stats */}
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary }}>
            Archived Today
          </Text>
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: c.textPrimary }}>
            {String(todayCount).padStart(2, '0')}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary }}>
            Top Category
          </Text>
          {topCategoryLabel ? (
            <View style={{ backgroundColor: '#cce8e4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#2e6863', textTransform: 'uppercase' }}>
                {topCategoryLabel}
              </Text>
            </View>
          ) : (
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textMuted }}>—</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function WeeklyArchiveLoad({ records }: { records: Record[] }) {
  const c = useTheme();
  const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // 이번 주 + 지난 주 각 요일별 카운트
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0=Mon
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);

  const thisWeekCounts = Array(7).fill(0);
  const lastWeekCounts = Array(7).fill(0);

  records.forEach((r) => {
    const d = new Date(r.occurredAt);
    const diff = Math.floor((d.getTime() - weekStart.getTime()) / 86400000);
    if (diff >= 0 && diff < 7) thisWeekCounts[diff]++;
    const diffLast = Math.floor((d.getTime() - lastWeekStart.getTime()) / 86400000);
    if (diffLast >= 0 && diffLast < 7) lastWeekCounts[diffLast]++;
  });

  const thisTotal = thisWeekCounts.reduce((a, b) => a + b, 0);
  const lastTotal = lastWeekCounts.reduce((a, b) => a + b, 0);
  const changePct = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : 0;
  const maxCount = Math.max(...thisWeekCounts, 1);

  return (
    <View style={{ backgroundColor: c.card, borderRadius: 8, padding: 32, marginBottom: 32, ...c.shadowMd }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: c.textPrimary, lineHeight: 28 }}>
          {'Weekly Archive\nLoad'}
        </Text>
        {lastTotal > 0 && (
          <Text style={{
            fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#2e6863',
            textTransform: 'uppercase', letterSpacing: 1.2, lineHeight: 16,
          }}>
            {changePct >= 0 ? `+${changePct}%` : `${changePct}%`} vs last{'\n'}week
          </Text>
        )}
      </View>

      {/* Bar chart */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 0 }}>
        {thisWeekCounts.map((count, i) => {
          const heightPct = (count / maxCount) * 100;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <View style={{
                width: '65%',
                borderRadius: 4,
                backgroundColor: count > 0 ? '#b3eee7' : c.section,
                height: `${Math.max(heightPct, count > 0 ? 8 : 4)}%`,
                marginBottom: 12,
              }} />
              <Text style={{
                fontFamily: 'Manrope_400Regular', fontSize: 10,
                color: c.textSecondary, textTransform: 'uppercase',
              }}>
                {DAY_LABELS[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RecordCard({ record }: { record: Record }) {
  const c = useTheme();
  const typeLabel = record.mistakeType ? MISTAKE_TYPE_LABELS[record.mistakeType] : null;
  const emotionLabel = record.emotion ? EMOTION_LABELS[record.emotion] : null;

  const now = new Date();
  const occurred = new Date(record.occurredAt);
  const diffH = Math.floor((now.getTime() - occurred.getTime()) / 3600000);
  const timeLabel = diffH < 1 ? 'JUST NOW'
    : diffH < 24 ? `${diffH}H AGO`
    : diffH < 48 ? 'YESTERDAY'
    : occurred.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

  return (
    <Pressable
      onPress={() => router.push(`/records/${record.id}`)}
      style={{
        backgroundColor: c.card, borderRadius: 8,
        marginBottom: 24, ...c.shadowMd,
      }}
    >
      {/* Top row: icon + time */}
      <View style={{ position: 'absolute', top: 24, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: c.section, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons
            name={record.nextActionDone ? 'check' : 'archive-outline'}
            size={20}
            color={c.textSecondary}
          />
        </View>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10, color: c.textSecondary }}>
          {timeLabel}
        </Text>
      </View>

      {/* Title */}
      <View style={{ position: 'absolute', top: 96, left: 24, right: 24 }}>
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: c.textPrimary, lineHeight: 28 }} numberOfLines={1}>
          {record.situation}
        </Text>
      </View>

      {/* Body */}
      <View style={{ position: 'absolute', top: 132, left: 24, right: 24, height: 40, overflow: 'hidden' }}>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary, lineHeight: 20 }} numberOfLines={2}>
          {record.myAction || record.cause || '—'}
        </Text>
      </View>

      {/* Tags */}
      <View style={{ position: 'absolute', top: 196, left: 24, right: 24, flexDirection: 'row', gap: 8 }}>
        {typeLabel && (
          <View style={{ backgroundColor: c.section, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 }}>
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10, color: c.textSecondary, textTransform: 'uppercase' }}>
              {typeLabel}
            </Text>
          </View>
        )}
        {emotionLabel && (
          <View style={{ backgroundColor: c.section, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 }}>
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10, color: c.textSecondary, textTransform: 'uppercase' }}>
              {emotionLabel}
            </Text>
          </View>
        )}
      </View>

      {/* Fixed height to accommodate absolute children */}
      <View style={{ height: 243 }} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const c = useTheme();
  const { token } = useAuthStore();

  const { data: profileData } = useQuery({
    queryKey: ['me'],
    queryFn: () => apiClient.getMe(),
    enabled: !!token,
  });

  const { data: allData, isLoading } = useQuery({
    queryKey: ['records', 'all-for-home'],
    queryFn: () => apiClient.getRecords(0, 200),
    enabled: !!token,
  });

  const allRecords = allData?.content ?? [];
  const recentRecords = allRecords.slice(0, 3);
  const streak = calculateStreak(allRecords);

  const displayName = profileData?.displayName || profileData?.email?.split('@')[0] || 'there';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        height: 64, backgroundColor: c.bg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <MaterialCommunityIcons name="menu" size={22} color={c.textPrimary} />
          <Text style={{
            fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#2e6863',
            letterSpacing: 1.8, textTransform: 'uppercase',
          }}>
            EXCUSE ARCHIVE
          </Text>
        </View>
        <MaterialCommunityIcons name="magnify" size={22} color={c.textPrimary} />
      </View>

      <ScrollView
        style={{ flex: 1, paddingTop: 64 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 120 }}
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: 48 }}>
          {/* Greeting label */}
          <Text style={{
            fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary,
            textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 8,
          }}>
            {greeting}, {displayName}
          </Text>

          {/* Main heading */}
          <Text style={{
            fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: c.textPrimary,
            letterSpacing: -0.9, lineHeight: 40, marginBottom: 24,
          }}>
            {'Ready to curate\nyour day?'}
          </Text>

          {/* Streak Banner */}
          {streak > 0 && (
            <LinearGradient
              colors={['#fdf2e9', '#fae5d3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: 8, padding: 32,
                shadowColor: '#2c333a', shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
                overflow: 'hidden',
              }}
            >
              {/* Decorative bg shape */}
              <View style={{
                position: 'absolute', top: -96, right: -96,
                width: 256, height: 256, borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
              }} />
              <Text style={{
                fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#935b3e',
                textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 8,
              }}>
                Consistency Streak
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                <Text style={{
                  fontFamily: 'Manrope_800ExtraBold', fontSize: 48, color: '#784628', lineHeight: 48,
                }}>
                  {streak}
                </Text>
                <Text style={{
                  fontFamily: 'Manrope_500Medium', fontSize: 18, color: 'rgba(120,70,40,0.8)',
                  marginBottom: 4,
                }}>
                  Days Active
                </Text>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Bento Grid */}
        {!isLoading && (
          <>
            <WeeklyArchiveLoad records={allRecords} />
            <ActivityHeatmap records={allRecords} />
          </>
        )}

        {isLoading && (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={c.accent} />
          </View>
        )}

        {/* Recent Submissions */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 24, color: c.textPrimary, lineHeight: 32 }}>
            {'Recent\nSubmissions'}
          </Text>
          <Pressable
            onPress={() => router.push('/records')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingTop: 4 }}
          >
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#2e6863', lineHeight: 20 }}>
              {'View full\narchive'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color="#2e6863" />
          </Pressable>
        </View>

        {recentRecords.length === 0 && !isLoading ? (
          <View style={{ backgroundColor: c.card, borderRadius: 8, padding: 32, alignItems: 'center', ...c.shadowMd }}>
            <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textMuted, marginBottom: 16 }}>
              아직 기록이 없습니다
            </Text>
            <Pressable onPress={() => router.push('/records/new')}>
              <Text style={{ fontFamily: 'Manrope_500Medium', color: '#2e6863' }}>첫 기록 작성하기</Text>
            </Pressable>
          </View>
        ) : (
          recentRecords.map((record) => <RecordCard key={record.id} record={record} />)
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/records/new')}
        style={{
          position: 'absolute', bottom: 96, right: 24,
          width: 56, height: 56, borderRadius: 12,
          backgroundColor: '#2e6863',
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
        }}
      >
        <MaterialCommunityIcons name="plus" size={22} color="#e1fffb" />
      </Pressable>
    </View>
  );
}
