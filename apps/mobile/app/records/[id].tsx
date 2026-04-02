import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import { useTheme } from '../../hooks/useTheme';

function InfoSection({ label, value }: { label: string; value?: string }) {
  const c = useTheme();
  if (!value) return null;
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: c.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textPrimary, fontSize: 15, lineHeight: 22 }}>{value}</Text>
    </View>
  );
}

export default function RecordDetailScreen() {
  const c = useTheme();
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
    Alert.alert('기록 삭제', '삭제된 기록은 복구할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg }}>
        <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textMuted }}>기록을 찾을 수 없습니다</Text>
      </View>
    );
  }

  const intensityColor = ['', '#4ade80', '#4ade80', '#facc15', '#fb923c', '#f87171'];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>

        {/* 메타 태그 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {record.mistakeType && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, backgroundColor: c.accentMuted, borderRadius: 9999 }}>
              <Text style={{ fontFamily: 'Manrope_500Medium', color: c.accent, fontSize: 12 }}>
                {MISTAKE_TYPE_LABELS[record.mistakeType]}
              </Text>
            </View>
          )}
          {record.emotion && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, backgroundColor: '#A855F718', borderRadius: 9999 }}>
              <Text style={{ fontFamily: 'Manrope_500Medium', color: '#A855F7', fontSize: 12 }}>{EMOTION_LABELS[record.emotion]}</Text>
            </View>
          )}
          {record.intensityLevel && (
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, backgroundColor: intensityColor[record.intensityLevel] + '20', borderRadius: 9999 }}>
              <Text style={{ fontFamily: 'Manrope_500Medium', color: intensityColor[record.intensityLevel], fontSize: 12 }}>강도 {record.intensityLevel}/5</Text>
            </View>
          )}
          <View style={{ paddingHorizontal: 12, paddingVertical: 5, backgroundColor: c.section, borderRadius: 9999 }}>
            <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textMuted, fontSize: 12 }}>
              {new Date(record.occurredAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* 본문 */}
        <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, marginBottom: 12, ...c.shadowMd }}>
          <InfoSection label="Situation (상황)" value={record.situation} />
          <InfoSection label="Action (행동)" value={record.myAction} />
          <InfoSection label="Result (결과)" value={record.result} />
          <InfoSection label="Cause (원인)" value={record.cause} />
        </View>

        {/* 다음 행동 */}
        <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, marginBottom: 12, ...c.shadowMd }}>
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: c.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Next Action
          </Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', color: c.textPrimary, fontSize: 15, lineHeight: 22, marginBottom: 16 }}>
            {record.nextAction}
          </Text>
          <Pressable
            onPress={() => toggleMutation.mutate(!record.nextActionDone)}
            disabled={toggleMutation.isPending}
          >
            {record.nextActionDone ? (
              <View style={{ backgroundColor: c.accentMuted, borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Manrope_700Bold', color: c.accent, fontSize: 14 }}>완료됨 ✓</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[c.gradientStart, c.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Manrope_700Bold', color: '#ffffff', fontSize: 14 }}>완료하기</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>

        {/* 재발 방지 */}
        {(record.recurrenceTrigger || record.recurrenceAction) && (
          <View style={{ backgroundColor: c.card, borderRadius: 24, padding: 24, marginBottom: 12, ...c.shadowMd }}>
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 11, color: c.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              재발 방지
            </Text>
            {record.recurrenceTrigger && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: c.textMuted, marginBottom: 3 }}>트리거</Text>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary }}>{record.recurrenceTrigger}</Text>
              </View>
            )}
            {record.recurrenceAction && (
              <View>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: c.textMuted, marginBottom: 3 }}>방지 행동</Text>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textSecondary }}>{record.recurrenceAction}</Text>
              </View>
            )}
          </View>
        )}

        {/* 삭제 */}
        <Pressable onPress={handleDelete} style={{ paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Manrope_400Regular', color: '#f87171', fontSize: 14 }}>기록 삭제</Text>
        </Pressable>

      </View>
    </ScrollView>
  );
}
