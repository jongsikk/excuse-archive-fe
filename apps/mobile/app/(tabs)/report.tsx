import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { PatternItem } from '@excuse-archive/shared';
import { calculateIntensityTrend } from '../../lib/insights';
const ACCENT = '#55D2C6';

function PatternBar({
  item,
  maxCount,
  color,
}: {
  item: PatternItem;
  maxCount: number;
  color: string;
}) {
  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

  return (
    <View className="flex-row items-center gap-3 mb-3">
      <Text className="w-20 text-sm text-gray-700" numberOfLines={1}>
        {item.key}
      </Text>
      <View className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <View
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
      <Text className="w-8 text-sm text-gray-600 text-right font-medium">{item.count}</Text>
    </View>
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
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
      <Text className="font-semibold text-gray-900 mb-4">{title}</Text>
      {items.length === 0 ? (
        <Text className="text-gray-400 text-sm">{emptyText}</Text>
      ) : (
        displayItems.map((item, index) => (
          <PatternBar key={index} item={item} maxCount={maxCount} color={color} />
        ))
      )}
    </View>
  );
}

function IntensityTrendChart({
  days,
  records,
}: {
  days: number;
  records: { label: string; avg: number }[];
}) {
  const maxAvg = 5;
  const hasData = records.some((r) => r.avg > 0);
  const displayRecords =
    days === 7 ? records : records.filter((_, i) => i % 5 === 0 || i === records.length - 1);

  const barColor = (avg: number) =>
    avg > 3 ? 'bg-red-400' : avg > 2 ? 'bg-yellow-400' : 'bg-emerald-400';

  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100">
      <Text className="font-semibold text-gray-900 mb-1">감정 강도 추이</Text>
      <Text className="text-xs text-gray-400 mb-4">일별 평균 강도 (1~5)</Text>

      {!hasData ? (
        <Text className="text-gray-400 text-sm">강도 데이터가 없습니다</Text>
      ) : (
        <>
          {/* 바 차트 */}
          <View className="flex-row items-end justify-between h-24 mb-2">
            {displayRecords.map((item, i) => {
              const heightPercent = item.avg > 0 ? (item.avg / maxAvg) * 100 : 0;
              return (
                <View key={i} className="flex-1 items-center mx-0.5">
                  <View className="w-full items-center justify-end" style={{ height: 80 }}>
                    {item.avg > 0 && (
                      <Text className="text-xs text-gray-400 mb-0.5">{item.avg}</Text>
                    )}
                    <View
                      className={`w-full rounded-t ${barColor(item.avg)} opacity-60`}
                      style={{
                        height: `${Math.max(heightPercent, item.avg > 0 ? 5 : 0)}%`,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {/* 날짜 레이블 */}
          <View className="flex-row justify-between">
            {displayRecords.map((item, i) => (
              <View key={i} className="flex-1 items-center">
                <Text className="text-xs text-gray-400">{item.label}</Text>
              </View>
            ))}
          </View>

          {/* 범례 */}
          <View className="flex-row flex-wrap gap-3 mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded bg-emerald-400 opacity-60" />
              <Text className="text-xs text-gray-400">낮음</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded bg-yellow-400 opacity-60" />
              <Text className="text-xs text-gray-400">보통</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded bg-red-400 opacity-60" />
              <Text className="text-xs text-gray-400">높음</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

export default function ReportScreen() {
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
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 py-4">
        {/* 헤더 */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">패턴 리포트</Text>
          <View className="flex-row bg-gray-100 rounded-full p-1">
            <Pressable
              onPress={() => setDays(7)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: days === 7 ? 'white' : 'transparent',
              }}
            >
              <Text style={{ color: days === 7 ? '#111827' : '#6B7280', fontWeight: days === 7 ? '600' : '400' }}>
                7일
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setDays(30)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: days === 30 ? 'white' : 'transparent',
              }}
            >
              <Text style={{ color: days === 30 ? '#111827' : '#6B7280', fontWeight: days === 30 ? '600' : '400' }}>
                30일
              </Text>
            </Pressable>
          </View>
        </View>

        {data && (
          <Text className="text-sm text-gray-400 mb-4">
            {new Date(data.since).toLocaleDateString('ko-KR')} ~{' '}
            {new Date(data.generatedAt).toLocaleDateString('ko-KR')} 기준
          </Text>
        )}

        {isLoading ? (
          <View className="py-8">
            <ActivityIndicator color={ACCENT} />
          </View>
        ) : data ? (
          <>
            <PatternSection
              title="Top 3 실수 유형"
              items={data.topMistakeTypes}
              labelMap={MISTAKE_TYPE_LABELS}
              color="bg-teal-400"
              emptyText="데이터가 없습니다"
            />
            <PatternSection
              title="Top 3 감정"
              items={data.topEmotions}
              labelMap={EMOTION_LABELS}
              color="bg-purple-400"
              emptyText="데이터가 없습니다"
            />
            <PatternSection
              title="Top 3 트리거"
              items={data.topTriggers}
              color="bg-orange-400"
              emptyText="데이터가 없습니다"
            />
            <IntensityTrendChart days={days} records={intensityTrend} />
          </>
        ) : (
          <View className="bg-white rounded-xl p-8 items-center border border-gray-100">
            <Text className="text-gray-400">리포트를 불러올 수 없습니다</Text>
          </View>
        )}

        {/* 안내 */}
        <View className="bg-gray-100 rounded-xl p-4 mt-2">
          <Text className="font-medium text-gray-700 mb-1">패턴 리포트란?</Text>
          <Text className="text-gray-500 text-sm">
            최근 기록을 분석해서 자주 발생하는 실수 유형, 그때의 감정, 트리거 상황을 보여줍니다.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
