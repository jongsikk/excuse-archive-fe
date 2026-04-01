import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { apiClient } from '../../lib/api';
import { getErrorMessage, MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { CreateRecordRequest, MistakeType, Emotion } from '@excuse-archive/shared';

const mistakeTypes: MistakeType[] = [
  'PROCRASTINATION',
  'TIME_MANAGEMENT',
  'COMMUNICATION',
  'FOCUS',
  'EMOTIONAL',
  'JUDGMENT',
  'AVOIDANCE',
  'OTHER',
];

const emotions: Emotion[] = [
  'ANXIETY',
  'GUILT',
  'EMBARRASSMENT',
  'RESTLESSNESS',
  'HELPLESSNESS',
  'ANGER',
  'SADNESS',
  'OTHER',
];

const STEPS = [
  { label: '무슨 일이?', desc: '상황과 행동을 기록하세요' },
  { label: '왜 그랬지?', desc: '원인과 감정을 분석하세요' },
  { label: '다음엔?', desc: '개선 계획을 세우세요' },
];

const ACCENT = '#55D2C6';

function StepIndicator({ current }: { current: number }) {
  return (
    <View className="flex-row items-center mb-6">
      {STEPS.map((step, i) => (
        <View key={i} className="flex-row items-center flex-1">
          <View className="items-center flex-1">
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: i < current ? ACCENT : i === current ? '#55D2C620' : '#343C47',
                borderWidth: 2,
                borderColor: i <= current ? ACCENT : '#4B5563',
              }}
            >
              <Text
                style={{
                  color: i < current ? '#202631' : i === current ? ACCENT : '#6B7280',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {i < current ? '✓' : String(i + 1)}
              </Text>
            </View>
            <Text
              className="text-xs mt-1"
              style={{ color: i === current ? ACCENT : '#6B7280' }}
            >
              {step.label}
            </Text>
          </View>
          {i < STEPS.length - 1 && (
            <View
              className="mb-4"
              style={{
                flex: 1,
                height: 2,
                backgroundColor: i < current ? ACCENT : '#343C47',
              }}
            />
          )}
        </View>
      ))}
    </View>
  );
}

function Field({
  label,
  required,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
}: {
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  multiline?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label} {required && <Text className="text-red-500">*</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        className={`bg-white px-3 py-2.5 rounded-xl border ${
          error ? 'border-red-400' : 'border-gray-200'
        }`}
        style={multiline ? { minHeight: 80, textAlignVertical: 'top' } : undefined}
      />
      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}

export default function RecordCreateScreen() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState<CreateRecordRequest>({
    occurredAt: new Date().toISOString(),
    situation: '',
    myAction: '',
    result: '',
    cause: '',
    nextAction: '',
    recurrenceTrigger: '',
    recurrenceAction: '',
    mistakeType: undefined,
    emotion: undefined,
    intensityLevel: 3,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: CreateRecordRequest) => apiClient.createRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      router.back();
    },
    onError: (error) => {
      Alert.alert('저장 실패', getErrorMessage(error));
    },
  });

  const updateField = (field: keyof CreateRecordRequest, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 0) {
      if (!formData.situation.trim()) newErrors.situation = '상황을 입력해주세요';
      if (!formData.myAction.trim()) newErrors.myAction = '내 행동을 입력해주세요';
      if (!formData.result.trim()) newErrors.result = '결과를 입력해주세요';
    } else if (s === 1) {
      if (!formData.cause.trim()) newErrors.cause = '원인을 입력해주세요';
    } else if (s === 2) {
      if (!formData.nextAction.trim()) newErrors.nextAction = '다음 행동을 입력해주세요';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(2)) return;
    mutation.mutate({
      ...formData,
      recurrenceTrigger: formData.recurrenceTrigger || undefined,
      recurrenceAction: formData.recurrenceAction || undefined,
    });
  };

  const intensityLabel = ['', '매우 약함', '약함', '보통', '강함', '매우 강함'];
  const intensityColor = ['', '#4ade80', '#4ade80', '#facc15', '#fb923c', '#f87171'];

  return (
    <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
      <View className="px-4 pt-4 pb-8">
        {/* 헤더 */}
        <View className="flex-row items-center gap-3 mb-5">
          <Pressable onPress={handleBack} className="p-2">
            <Text className="text-gray-500 text-lg">←</Text>
          </Pressable>
          <View>
            <Text className="text-lg font-bold text-gray-900">새 기록</Text>
            <Text className="text-xs text-gray-500">{STEPS[step].desc}</Text>
          </View>
        </View>

        <StepIndicator current={step} />

        {/* Step 1: 무슨 일이? */}
        {step === 0 && (
          <>
            <Field
              label="상황"
              required
              placeholder="어떤 상황이었나요?"
              value={formData.situation}
              onChangeText={(v) => updateField('situation', v)}
              error={errors.situation}
              multiline
            />
            <Field
              label="내 행동"
              required
              placeholder="나는 어떻게 행동했나요?"
              value={formData.myAction}
              onChangeText={(v) => updateField('myAction', v)}
              error={errors.myAction}
              multiline
            />
            <Field
              label="결과"
              required
              placeholder="어떤 결과가 있었나요?"
              value={formData.result}
              onChangeText={(v) => updateField('result', v)}
              error={errors.result}
              multiline
            />
          </>
        )}

        {/* Step 2: 왜 그랬지? */}
        {step === 1 && (
          <>
            <Field
              label="원인"
              required
              placeholder="왜 그렇게 행동했을까요?"
              value={formData.cause}
              onChangeText={(v) => updateField('cause', v)}
              error={errors.cause}
              multiline
            />

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">실수 유형 (선택)</Text>
              <View className="flex-row flex-wrap gap-2">
                {mistakeTypes.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => updateField('mistakeType', formData.mistakeType === type ? undefined : type)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      borderWidth: 1,
                      backgroundColor: formData.mistakeType === type ? '#55D2C620' : 'white',
                      borderColor: formData.mistakeType === type ? ACCENT : '#E5E7EB',
                    }}
                  >
                    <Text style={{ color: formData.mistakeType === type ? ACCENT : '#374151', fontSize: 13 }}>
                      {MISTAKE_TYPE_LABELS[type]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm text-gray-600 mb-2">감정 (선택)</Text>
              <View className="flex-row flex-wrap gap-2">
                {emotions.map((emotion) => (
                  <Pressable
                    key={emotion}
                    onPress={() => updateField('emotion', formData.emotion === emotion ? undefined : emotion)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      borderWidth: 1,
                      backgroundColor: formData.emotion === emotion ? '#A855F720' : 'white',
                      borderColor: formData.emotion === emotion ? '#A855F7' : '#E5E7EB',
                    }}
                  >
                    <Text style={{ color: formData.emotion === emotion ? '#A855F7' : '#374151', fontSize: 13 }}>
                      {EMOTION_LABELS[emotion]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">강도 (선택)</Text>
                <Text style={{ color: intensityColor[formData.intensityLevel ?? 3], fontWeight: '600', fontSize: 13 }}>
                  {formData.intensityLevel} — {intensityLabel[formData.intensityLevel ?? 3]}
                </Text>
              </View>
              <View className="flex-row justify-between">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Pressable
                    key={v}
                    onPress={() => updateField('intensityLevel', v)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: formData.intensityLevel === v ? intensityColor[v] + '30' : '#F3F4F6',
                      borderWidth: 2,
                      borderColor: formData.intensityLevel === v ? intensityColor[v] : 'transparent',
                    }}
                  >
                    <Text style={{ color: intensityColor[v], fontWeight: '700' }}>{v}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Step 3: 다음엔? */}
        {step === 2 && (
          <>
            <View className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
              <Text className="text-blue-600 text-xs">
                💡 칭찬/성과/요약 금지. '실수/후회'만 기록합니다.
              </Text>
            </View>

            <Field
              label="다음 행동"
              required
              placeholder="다음에는 어떻게 할 건가요? (내가 통제할 수 있는 행동)"
              value={formData.nextAction}
              onChangeText={(v) => updateField('nextAction', v)}
              error={errors.nextAction}
              multiline
            />
            <Field
              label="재발 트리거 (선택)"
              placeholder="예: 회의 직후, 오전 업무 시작"
              value={formData.recurrenceTrigger ?? ''}
              onChangeText={(v) => updateField('recurrenceTrigger', v)}
            />
            <Field
              label="재발 방지 행동 (선택)"
              placeholder="예: 타이머 10분 + 미처리 건 1개만"
              value={formData.recurrenceAction ?? ''}
              onChangeText={(v) => updateField('recurrenceAction', v)}
            />
          </>
        )}

        {/* 하단 버튼 */}
        <View className="flex-row gap-3 mt-4">
          <Pressable
            onPress={handleBack}
            className="flex-1 py-4 rounded-xl bg-gray-100 items-center"
          >
            <Text className="text-gray-600 font-medium">{step === 0 ? '취소' : '이전'}</Text>
          </Pressable>

          {step < 2 ? (
            <Pressable
              onPress={handleNext}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: ACCENT + '20', borderWidth: 1, borderColor: ACCENT }}
            >
              <Text style={{ color: ACCENT, fontWeight: '600' }}>다음 →</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSubmit}
              disabled={mutation.isPending}
              className="flex-1 py-4 rounded-xl items-center"
              style={{ backgroundColor: mutation.isPending ? '#D1D5DB' : ACCENT }}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold">저장하기</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
