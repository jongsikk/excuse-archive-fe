import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { Record } from '@excuse-archive/shared';
import { calculateStreak, calculateWeeklySummary, calculateCalendarHeatmap } from '../../lib/insights';

const CELL = 13;
const GAP = 3;

function heatmapBg(count: number, avgIntensity: number): string {
  if (count === 0) return '#2B3340';
  if (avgIntensity === 0) return '#55D2C640';
  if (avgIntensity <= 2) return '#4ade80';
  if (avgIntensity <= 3) return '#facc15';
  if (avgIntensity <= 4) return '#fb923c';
  return '#f87171';
}

function CalendarHeatmap({ records }: { records: Record[] }) {
  const cells = calculateCalendarHeatmap(records, 70); // 10주
  const today = new Date().toISOString().split('T')[0];

  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // 월 레이블: 각 주의 첫 날이 새 달이면 표시
  const monthLabels: (string | null)[] = weeks.map((week) => {
    const firstDay = week[0]?.date;
    if (!firstDay) return null;
    const d = new Date(firstDay + 'T00:00:00Z');
    if (d.getUTCDate() <= 7) {
      return `${d.getUTCMonth() + 1}월`;
    }
    return null;
  });

  const DAY_LABELS = ['일', '', '화', '', '목', '', '토'];

  return (
    <View
      style={{
        backgroundColor: '#1e2530',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#343C47',
      }}
    >
      {/* 헤더 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontWeight: '600', color: '#EAF0FA', fontSize: 14 }}>기록 히트맵</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 10, color: '#6B7280' }}>적음</Text>
          {['#2B3340', '#55D2C640', '#4ade80', '#facc15', '#f87171'].map((c, i) => (
            <View key={i} style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: c }} />
          ))}
          <Text style={{ fontSize: 10, color: '#6B7280' }}>많음</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* 월 레이블 */}
          <View style={{ flexDirection: 'row', marginLeft: 20, marginBottom: 4, gap: GAP }}>
            {weeks.map((_, wi) => (
              <View key={wi} style={{ width: CELL }}>
                {monthLabels[wi] ? (
                  <Text style={{ fontSize: 9, color: '#6B7280', textAlign: 'center' }}>
                    {monthLabels[wi]}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          {/* 요일 레이블 + 셀 */}
          <View style={{ flexDirection: 'row' }}>
            {/* 요일 레이블 */}
            <View style={{ flexDirection: 'column', gap: GAP, marginRight: 6 }}>
              {DAY_LABELS.map((d, i) => (
                <View key={i} style={{ width: 14, height: CELL, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 9, color: '#6B7280', textAlign: 'right' }}>{d}</Text>
                </View>
              ))}
            </View>

            {/* 주별 컬럼 */}
            <View style={{ flexDirection: 'row', gap: GAP }}>
              {weeks.map((week, wi) => (
                <View key={wi} style={{ flexDirection: 'column', gap: GAP }}>
                  {week.map((cell, di) => (
                    <View
                      key={di}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        backgroundColor: heatmapBg(cell.count, cell.avgIntensity),
                        borderWidth: cell.date === today ? 1 : 0,
                        borderColor: '#55D2C6',
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 8 }}>최근 10주 기록 현황</Text>
    </View>
  );
}

function RecordCard({ record }: { record: Record }) {
  return (
    <Pressable
      onPress={() => router.push(`/records/${record.id}`)}
      className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-gray-900 font-medium" numberOfLines={2}>
            {record.situation}
          </Text>
          <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
            {record.myAction}
          </Text>
        </View>
        {record.nextActionDone && (
          <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
            <Text className="text-green-700 text-xs">완료</Text>
          </View>
        )}
      </View>
      <View className="flex-row items-center gap-2 mt-3 flex-wrap">
        {record.mistakeType && (
          <View className="px-2 py-0.5 bg-gray-100 rounded">
            <Text className="text-gray-600 text-xs">{MISTAKE_TYPE_LABELS[record.mistakeType]}</Text>
          </View>
        )}
        {record.emotion && (
          <View className="px-2 py-0.5 bg-gray-100 rounded">
            <Text className="text-gray-600 text-xs">{EMOTION_LABELS[record.emotion]}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { token, isLoading: authLoading } = useAuthStore();

  const { data: allData, isLoading } = useQuery({
    queryKey: ['records', 'all-for-home'],
    queryFn: () => apiClient.getRecords(0, 200),
    enabled: !!token,
  });

  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#55D2C6" />
        <Text className="text-gray-500 mt-4">인증 중...</Text>
      </View>
    );
  }

  const allRecords = allData?.content ?? [];
  const recentRecords = allRecords.slice(0, 3);
  const streak = calculateStreak(allRecords);
  const summary = calculateWeeklySummary(allRecords);
  const pendingCount = allRecords.filter((r) => !r.nextActionDone).length;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        {/* 헤더 */}
        <View className="items-center py-4 mb-2">
          <Text className="text-3xl font-bold text-gray-900">변명아카이브</Text>
          <Text className="text-gray-500 mt-1 text-sm">비난 대신 관찰, 후회를 성장으로</Text>
        </View>

        {/* 스트릭 */}
        {streak > 0 && (
          <View className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-3 flex-row items-center">
            <Text className="text-2xl mr-3">🔥</Text>
            <View>
              <Text className="font-semibold text-orange-800">{streak}일 연속 기록 중</Text>
              <Text className="text-orange-600 text-xs mt-0.5">오늘도 기록하면 {streak + 1}일!</Text>
            </View>
          </View>
        )}

        {/* 미완료 배너 */}
        {pendingCount > 0 && (
          <Pressable
            onPress={() => router.push({ pathname: '/records', params: { filter: 'pending' } })}
            className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Text className="text-xl mr-3">📌</Text>
              <View>
                <Text className="font-semibold text-blue-800">아직 못 한 것들 {pendingCount}개</Text>
                <Text className="text-blue-600 text-xs mt-0.5">다음 행동을 확인해보세요</Text>
              </View>
            </View>
            <Text className="text-blue-500">→</Text>
          </Pressable>
        )}

        {/* 새 기록 버튼 */}
        <Pressable
          onPress={() => router.push('/records/new')}
          className="py-4 rounded-xl mb-5"
          style={{ backgroundColor: '#55D2C6' }}
        >
          <Text className="text-white text-center font-semibold">+ 새 기록 작성하기</Text>
        </Pressable>

        {/* 캘린더 히트맵 */}
        {!isLoading && <CalendarHeatmap records={allRecords} />}

        {/* 주간 요약 */}
        {!isLoading && summary.total > 0 && (
          <View className="bg-white rounded-xl p-4 mb-5 border border-gray-200">
            <Text className="font-semibold text-gray-900 mb-3">지난 7일 요약</Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-gray-900">{summary.total}</Text>
                <Text className="text-xs text-gray-500 mt-1">총 기록</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-green-600">{summary.completionRate}%</Text>
                <Text className="text-xs text-gray-500 mt-1">완료율</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600">{summary.completed}</Text>
                <Text className="text-xs text-gray-500 mt-1">완료한 행동</Text>
              </View>
            </View>
            {summary.topTypeLabel && (
              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-xs text-gray-500">
                  가장 많이 반복된 유형:{' '}
                  <Text className="text-gray-800 font-medium">{summary.topTypeLabel}</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 최근 기록 */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-semibold text-gray-900">최근 기록</Text>
          <Pressable onPress={() => router.push('/records')}>
            <Text className="text-sm" style={{ color: '#55D2C6' }}>전체보기 →</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View className="py-8">
            <ActivityIndicator color="#55D2C6" />
          </View>
        ) : recentRecords.length === 0 ? (
          <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
            <Text className="text-gray-500 mb-4">아직 기록이 없습니다</Text>
            <Pressable onPress={() => router.push('/records/new')}>
              <Text className="font-medium" style={{ color: '#55D2C6' }}>첫 기록 작성하기</Text>
            </Pressable>
          </View>
        ) : (
          recentRecords.map((record) => <RecordCard key={record.id} record={record} />)
        )}

        {/* 패턴 리포트 바로가기 */}
        <Pressable
          onPress={() => router.push('/report')}
          className="bg-white rounded-xl p-5 mt-2 border border-gray-200"
        >
          <Text className="font-semibold text-gray-900 mb-1">📊 나의 패턴 분석</Text>
          <Text className="text-gray-500 text-sm">
            최근 7일/30일 동안의 실수 유형, 감정, 트리거를 확인해보세요
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
