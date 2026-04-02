import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { MISTAKE_TYPE_LABELS } from '@excuse-archive/shared';
import type { Record } from '@excuse-archive/shared';
import { useTheme } from '../../hooks/useTheme';

type FilterType = 'all' | 'pending';

function RecordCard({ record }: { record: Record }) {
  const c = useTheme();
  const typeLabel = record.mistakeType ? MISTAKE_TYPE_LABELS[record.mistakeType] : null;
  const dateStr = new Date(record.occurredAt).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace('.', '');

  return (
    <Pressable
      onPress={() => router.push(`/records/${record.id}`)}
      style={{ backgroundColor: c.card, borderRadius: 24, padding: 20, marginHorizontal: 16, marginBottom: 12, ...c.shadowSm }}
    >
      {/* 상단: 타입 태그 + 날짜 */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        {typeLabel ? (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: c.accentMuted, borderRadius: 9999 }}>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: c.accent, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {typeLabel}
            </Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: c.section, borderRadius: 9999 }}>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 10, color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              기타
            </Text>
          </View>
        )}
        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textMuted }}>{dateStr}</Text>
      </View>

      {/* 제목 */}
      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: c.textPrimary, lineHeight: 24, marginBottom: 8 }} numberOfLines={2}>
        {record.situation}
      </Text>

      {/* 요약 */}
      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: c.textSecondary, lineHeight: 20 }} numberOfLines={2}>
        {record.myAction}
      </Text>

      {/* 하단: 완료 상태 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.accentFill + '30', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 11, color: c.accent }}>
              {record.situation?.slice(0, 1).toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12, color: c.textMuted }}>아카이브</Text>
        </View>
        {record.nextActionDone ? (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: c.accentMuted, borderRadius: 9999 }}>
            <Text style={{ color: c.accent, fontSize: 11, fontFamily: 'Manrope_500Medium' }}>완료 ✓</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: '#FB923C18', borderRadius: 9999 }}>
            <Text style={{ color: '#FB923C', fontSize: 11, fontFamily: 'Manrope_500Medium' }}>미완료</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function RecordsScreen() {
  const c = useTheme();
  const { token } = useAuthStore();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (params.filter === 'pending') setFilter('pending');
  }, [params.filter]);

  const { data: pagedData, isLoading: pagedLoading } = useQuery({
    queryKey: ['records', page],
    queryFn: () => apiClient.getRecords(page, 10),
    enabled: !!token && filter === 'all',
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['records', 'all-for-filter'],
    queryFn: () => apiClient.getRecords(0, 200),
    enabled: !!token && filter === 'pending',
  });

  const isLoading = filter === 'all' ? pagedLoading : allLoading;
  const displayRecords: Record[] =
    filter === 'pending'
      ? (allData?.content ?? []).filter((r) => !r.nextActionDone)
      : (pagedData?.content ?? []);

  const totalPages = pagedData?.totalPages ?? 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* 헤더 */}
      <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 40, color: c.textPrimary, letterSpacing: -1, lineHeight: 44 }}>내 기록</Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary, marginTop: 4 }}>아카이브된 모든 순간의 기록들</Text>
        </View>
        <Pressable onPress={() => router.push('/records/new')}>
          <LinearGradient
            colors={[c.gradientStart, c.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 9999, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ fontFamily: 'Manrope_700Bold', color: '#ffffff', fontSize: 14 }}>+ New</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* 필터 탭 */}
      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: c.section, borderRadius: 14, padding: 4 }}>
          {(['all', 'pending'] as FilterType[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => { setFilter(f); if (f === 'all') setPage(0); }}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: filter === f ? c.card : 'transparent',
              }}
            >
              <Text style={{
                fontFamily: 'Manrope_600SemiBold',
                fontSize: 13,
                color: filter === f ? c.accent : c.textMuted,
              }}>
                {f === 'all' ? 'All' : 'Pending'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={c.accent} />
        </View>
      ) : displayRecords.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}>
          {filter === 'pending' ? (
            <>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎉</Text>
              <Text style={{ fontFamily: 'Manrope_700Bold', color: c.textPrimary, fontSize: 16, marginBottom: 4 }}>미완료 행동이 없어요</Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textMuted, fontSize: 13 }}>모든 다음 행동을 완료했습니다</Text>
            </>
          ) : (
            <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 32, alignItems: 'center', width: '100%' }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📦</Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textMuted, marginBottom: 16, fontSize: 14 }}>기록을 추가해 주세요</Text>
              <Pressable onPress={() => router.push('/records/new')}>
                <Text style={{ fontFamily: 'Manrope_500Medium', color: c.accent }}>첫 기록 작성하기</Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={displayRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RecordCard record={item} />}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
          ListFooterComponent={
            filter === 'all' && totalPages > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: 20, paddingHorizontal: 16 }}>
                <Pressable
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: page === 0 ? c.section : c.card }}
                >
                  <Text style={{ fontFamily: 'Manrope_500Medium', color: page === 0 ? c.textMuted : c.textPrimary }}>‹</Text>
                </Pressable>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setPage(i)}
                    style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: page === i ? c.accent : c.card }}
                  >
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: page === i ? '#ffffff' : c.textMuted }}>{i + 1}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: page >= totalPages - 1 ? c.section : c.card }}
                >
                  <Text style={{ fontFamily: 'Manrope_500Medium', color: page >= totalPages - 1 ? c.textMuted : c.textPrimary }}>›</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
