import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { PatternItem } from '@excuse-archive/shared';
import { calculateIntensityTrend } from '../../lib/insights';
import { useTheme } from '../../hooks/useTheme';

const EMOTION_EMOJI: Record<string, string> = {
  ANXIETY: '😰', GUILT: '😔', EMBARRASSMENT: '😳',
  RESTLESSNESS: '😤', HELPLESSNESS: '😶‍🌫️', ANGER: '😠', SADNESS: '😢', OTHER: '🫠',
};

function HBar({ item, maxCount, color }: { item: PatternItem & { key: string }; maxCount: number; color: string }) {
  const c = useTheme();
  const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: c.textPrimary }}>{item.key}</Text>
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: c.textMuted }}>{item.count}회</Text>
      </View>
      <View style={{ height: 10, backgroundColor: c.section, borderRadius: 9999, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: 9999, backgroundColor: color, width: `${pct}%` }} />
      </View>
    </View>
  );
}

function EmotionBar({ item, maxCount }: { item: PatternItem; maxCount: number }) {
  const c = useTheme();
  const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
  const label = EMOTION_LABELS[item.key as keyof typeof EMOTION_LABELS] || item.key;
  const emoji = EMOTION_EMOJI[item.key] || '😶';
  const colors = ['#55d2c6', '#A78BFA', '#bcc9c6'];
  const idx = Object.keys(EMOTION_EMOJI).indexOf(item.key);
  const color = colors[idx % colors.length];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: c.textPrimary }}>{label}</Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textMuted }}>{item.count}회</Text>
        </View>
        <View style={{ height: 8, backgroundColor: c.section, borderRadius: 9999, overflow: 'hidden' }}>
          <View style={{ height: '100%', borderRadius: 9999, backgroundColor: color, width: `${pct}%` }} />
        </View>
      </View>
    </View>
  );
}

function IntensityChart({ days, records }: { days: number; records: { label: string; avg: number }[] }) {
  const c = useTheme();
  const hasData = records.some((r) => r.avg > 0);
  const displayRecords = days === 7 ? records : records.filter((_, i) => i % 5 === 0 || i === records.length - 1);
  const barColor = (avg: number) => avg > 3 ? '#fb923c' : avg > 2 ? '#facc15' : '#55d2c6';
  const maxVal = Math.max(...displayRecords.map((r) => r.avg), 1);

  return (
    <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, marginBottom: 14, ...c.shadowMd }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <View>
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 17, color: c.textPrimary, marginBottom: 2 }}>변명 강도 추이</Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textMuted }}>시간에 따른 평균 감정 강도</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {(() => {
            const withData = displayRecords.filter((r) => r.avg > 0);
            const avg = withData.length > 0
              ? (withData.reduce((s, r) => s + r.avg, 0) / withData.length).toFixed(1)
              : '-';
            return (
              <>
                <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 28, color: c.accent, lineHeight: 30 }}>{avg}</Text>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 10, color: c.textMuted }}>이번 기간 평균</Text>
              </>
            );
          })()}
        </View>
      </View>

      {!hasData ? (
        <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textMuted, fontSize: 13 }}>강도 데이터가 없습니다</Text>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, marginBottom: 8, gap: 4 }}>
            {displayRecords.map((item, i) => {
              const heightPct = item.avg > 0 ? (item.avg / maxVal) * 100 : 0;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <View style={{
                    width: '100%', borderRadius: 6,
                    backgroundColor: item.avg > 0 ? barColor(item.avg) : c.section,
                    height: `${Math.max(heightPct, item.avg > 0 ? 8 : 5)}%`,
                  }} />
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {displayRecords.map((item, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 9, color: c.textMuted }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export default function ReportScreen() {
  const c = useTheme();
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

  const mistakeItems = (data?.topMistakeTypes ?? []).map((item) => ({
    ...item,
    key: MISTAKE_TYPE_LABELS[item.key as keyof typeof MISTAKE_TYPE_LABELS] || item.key,
  }));
  const maxMistake = mistakeItems.length > 0 ? Math.max(...mistakeItems.map((i) => i.count)) : 0;

  const triggerItems = data?.topTriggers ?? [];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 40 }}>

        {/* 에디토리얼 헤더 */}
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 12, color: c.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>ANALYTICS</Text>
          <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: c.textPrimary, letterSpacing: -0.8, lineHeight: 40 }}>패턴 리포트</Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary, marginTop: 8, lineHeight: 22 }}>당신의 변명이 그리는 숨겨진 궤적을 확인하세요.</Text>
        </View>

        {/* 기간 선택 */}
        <View style={{ marginTop: 20, marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', backgroundColor: c.section, borderRadius: 16, padding: 4, alignSelf: 'flex-start' }}>
            {([7, 30] as (7 | 30)[]).map((d) => (
              <Pressable
                key={d}
                onPress={() => setDays(d)}
                style={{
                  paddingHorizontal: 24, paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: days === d ? c.card : 'transparent',
                }}
              >
                <Text style={{ fontFamily: 'Manrope_600SemiBold', color: days === d ? c.accent : c.textMuted, fontSize: 14 }}>
                  {d}일
                </Text>
              </Pressable>
            ))}
          </View>
          {data && (
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textMuted, marginTop: 8 }}>
              {new Date(data.since).toLocaleDateString('ko-KR')} ~ {new Date(data.generatedAt).toLocaleDateString('ko-KR')}
            </Text>
          )}
        </View>

        {isLoading ? (
          <View style={{ paddingVertical: 48, alignItems: 'center' }}>
            <ActivityIndicator color={c.accent} />
          </View>
        ) : data ? (
          <>
            {/* 강도 추이 차트 */}
            <IntensityChart days={days} records={intensityTrend} />

            {/* 주요 변명 유형 */}
            {mistakeItems.length > 0 && (
              <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, marginBottom: 14, ...c.shadowMd }}>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 17, color: c.textPrimary, marginBottom: 20 }}>주요 변명 유형</Text>
                {mistakeItems.map((item, i) => (
                  <HBar key={i} item={item} maxCount={maxMistake} color={i === 0 ? c.accent : i === 1 ? c.accentFill : c.outlineVariant} />
                ))}
              </View>
            )}

            {/* 동반된 감정 */}
            {data.topEmotions.length > 0 && (
              <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, marginBottom: 14, ...c.shadowMd }}>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 17, color: c.textPrimary, marginBottom: 20 }}>동반된 감정</Text>
                {data.topEmotions.map((item, i) => (
                  <EmotionBar key={i} item={item} maxCount={data.topEmotions[0]?.count ?? 1} />
                ))}
              </View>
            )}

            {/* 주요 트리거 */}
            {triggerItems.length > 0 && (
              <View style={{ backgroundColor: c.section, borderRadius: 24, padding: 24, marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 17, color: c.textPrimary, marginBottom: 16 }}>주요 트리거</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {triggerItems.map((item, i) => (
                    <View
                      key={i}
                      style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: c.card, borderRadius: 16 }}
                    >
                      <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 13, color: i === 0 ? c.accent : c.textSecondary }}>
                        #{item.key}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Curator's Advice 인사이트 카드 */}
            {data.topMistakeTypes.length > 0 && (
              <View style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 14 }}>
                <LinearGradient
                  colors={['#2c333a', '#2c333a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 24 }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Text style={{ fontSize: 16 }}>✨</Text>
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 11, color: '#ffffffcc', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                      Curator's Advice
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 20, color: '#ffffff', lineHeight: 28, marginBottom: 12 }}>
                    "{MISTAKE_TYPE_LABELS[data.topMistakeTypes[0]?.key as keyof typeof MISTAKE_TYPE_LABELS] || data.topMistakeTypes[0]?.key}이{'\n'}당신의 성장을 잠시 늦추고 있네요."
                  </Text>
                  <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#ffffffcc', lineHeight: 22 }}>
                    기록된 데이터에 따르면, 이 패턴이 가장 자주 나타납니다. 이를 인식하는 것만으로도 이미 변화의 첫 걸음을 뗀 것입니다.
                  </Text>
                </LinearGradient>
              </View>
            )}
          </>
        ) : (
          <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 32, alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textMuted }}>리포트를 불러올 수 없습니다</Text>
          </View>
        )}

      </View>
    </ScrollView>
  );
}
