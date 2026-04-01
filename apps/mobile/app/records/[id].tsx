import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: record, isLoading } = useQuery({
    queryKey: ['record', id],
    queryFn: () => apiClient.getRecord(Number(id)),
    enabled: !!id,
  });

  const toggleMutation = useMutation({
    mutationFn: (done: boolean) => apiClient.updateRecord(Number(id), { nextActionDone: done }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', id] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteRecord(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('기록 삭제', '이 기록을 삭제하시겠습니까?\n삭제된 기록은 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#0ea5e9" />
      </View>
    );
  }

  if (!record) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">기록을 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="m-4 bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 메타 정보 */}
        <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <View className="flex-row flex-wrap gap-2">
            {record.mistakeType && (
              <View className="px-2 py-1 bg-blue-100 rounded">
                <Text className="text-blue-700 text-xs">
                  {MISTAKE_TYPE_LABELS[record.mistakeType]}
                </Text>
              </View>
            )}
            {record.emotion && (
              <View className="px-2 py-1 bg-purple-100 rounded">
                <Text className="text-purple-700 text-xs">{EMOTION_LABELS[record.emotion]}</Text>
              </View>
            )}
            {record.intensityLevel && (
              <View className="px-2 py-1 bg-gray-100 rounded">
                <Text className="text-gray-700 text-xs">강도 {record.intensityLevel}/5</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-gray-500 mt-2">
            {new Date(record.occurredAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* 본문 */}
        <View className="p-4">
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-500 mb-1">상황</Text>
            <Text className="text-gray-900">{record.situation}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-500 mb-1">내 행동</Text>
            <Text className="text-gray-900">{record.myAction}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-500 mb-1">결과</Text>
            <Text className="text-gray-900">{record.result}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-500 mb-1">원인</Text>
            <Text className="text-gray-900">{record.cause}</Text>
          </View>

          {/* 다음 행동 */}
          <View className="bg-blue-50 -mx-4 px-4 py-4 mt-2">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-4">
                <Text className="text-sm font-medium text-blue-700 mb-1">다음 행동</Text>
                <Text className="text-gray-900">{record.nextAction}</Text>
              </View>
              <Pressable
                onPress={() => toggleMutation.mutate(!record.nextActionDone)}
                disabled={toggleMutation.isPending}
                className={`px-4 py-2 rounded-lg ${
                  record.nextActionDone ? 'bg-green-600' : 'bg-white border border-gray-300'
                }`}
              >
                <Text className={record.nextActionDone ? 'text-white' : 'text-gray-700'}>
                  {record.nextActionDone ? '완료됨 ✓' : '완료하기'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 재발 방지 */}
          {(record.recurrenceTrigger || record.recurrenceAction) && (
            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-sm font-medium text-gray-500 mb-2">재발 방지</Text>
              {record.recurrenceTrigger && (
                <Text className="text-sm text-gray-700 mb-1">
                  <Text className="text-gray-500">트리거: </Text>
                  {record.recurrenceTrigger}
                </Text>
              )}
              {record.recurrenceAction && (
                <Text className="text-sm text-gray-700">
                  <Text className="text-gray-500">방지 행동: </Text>
                  {record.recurrenceAction}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 삭제 버튼 */}
      <View className="px-4 mb-8">
        <Pressable onPress={handleDelete} className="py-3">
          <Text className="text-red-600 text-center">기록 삭제</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
