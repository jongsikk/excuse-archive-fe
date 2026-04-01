import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { Record } from '@excuse-archive/shared';

type FilterType = 'all' | 'pending';

function RecordCard({ record }: { record: Record }) {
  return (
    <Pressable
      onPress={() => router.push(`/records/${record.id}`)}
      className="bg-white rounded-xl p-4 mx-4 mb-3 border border-gray-200"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-gray-900 font-medium">{record.situation}</Text>
          <Text className="text-gray-600 text-sm mt-1">{record.myAction}</Text>
        </View>
        {record.nextActionDone ? (
          <View className="ml-2 px-2 py-1 bg-green-100 rounded-full">
            <Text className="text-green-700 text-xs">완료</Text>
          </View>
        ) : (
          <View className="ml-2 px-2 py-1 bg-orange-100 rounded-full">
            <Text className="text-orange-700 text-xs">미완료</Text>
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
      <View className="mt-2">
        <Text className="text-sm text-gray-700" numberOfLines={1}>
          <Text className="font-medium">다음 행동: </Text>
          {record.nextAction}
        </Text>
      </View>
    </Pressable>
  );
}

export default function RecordsScreen() {
  const { token } = useAuthStore();
  const params = useLocalSearchParams<{ filter?: string }>();
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (params.filter === 'pending') {
      setFilter('pending');
    }
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
    <View className="flex-1 bg-gray-50">
      {/* 헤더 */}
      <View className="flex-row justify-between items-center px-4 py-4">
        <Text className="text-2xl font-bold text-gray-900">내 기록</Text>
        <Pressable
          onPress={() => router.push('/records/new')}
          className="bg-primary-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white text-sm font-medium">+ 새 기록</Text>
        </Pressable>
      </View>

      {/* 필터 탭 */}
      <View className="flex-row bg-gray-100 mx-4 rounded-lg p-1 mb-3">
        <Pressable
          onPress={() => { setFilter('all'); setPage(0); }}
          className={`flex-1 py-2 rounded-md items-center ${filter === 'all' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-sm font-medium ${filter === 'all' ? 'text-gray-900' : 'text-gray-500'}`}>
            전체
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilter('pending')}
          className={`flex-1 py-2 rounded-md items-center ${filter === 'pending' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`text-sm font-medium ${filter === 'pending' ? 'text-orange-600' : 'text-gray-500'}`}>
            미완료
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0ea5e9" />
        </View>
      ) : displayRecords.length === 0 ? (
        <View className="flex-1 items-center justify-center px-4">
          {filter === 'pending' ? (
            <>
              <Text className="text-4xl mb-4">🎉</Text>
              <Text className="text-gray-700 font-medium mb-1">미완료 행동이 없어요</Text>
              <Text className="text-gray-500 text-sm">모든 다음 행동을 완료했습니다</Text>
            </>
          ) : (
            <>
              <Text className="text-gray-500 mb-4">아직 기록이 없습니다</Text>
              <Pressable onPress={() => router.push('/records/new')}>
                <Text className="text-primary-600 font-medium">첫 기록 작성하기</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={displayRecords}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RecordCard record={item} />}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListFooterComponent={
            filter === 'all' && totalPages > 1 ? (
              <View className="flex-row justify-center gap-4 py-4">
                <Pressable
                  onPress={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={`px-4 py-2 rounded-lg border ${page === 0 ? 'border-gray-200' : 'border-gray-400'}`}
                >
                  <Text className={page === 0 ? 'text-gray-300' : 'text-gray-700'}>이전</Text>
                </Pressable>
                <View className="justify-center">
                  <Text className="text-gray-500 text-sm">
                    {page + 1} / {totalPages}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className={`px-4 py-2 rounded-lg border ${page >= totalPages - 1 ? 'border-gray-200' : 'border-gray-400'}`}
                >
                  <Text className={page >= totalPages - 1 ? 'text-gray-300' : 'text-gray-700'}>다음</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
