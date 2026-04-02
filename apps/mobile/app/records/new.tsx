import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../../lib/api';
import { getErrorMessage, MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { CreateRecordRequest, MistakeType, Emotion } from '@excuse-archive/shared';
import { useTheme } from '../../hooks/useTheme';

const mistakeTypes: MistakeType[] = ['PROCRASTINATION', 'TIME_MANAGEMENT', 'COMMUNICATION', 'FOCUS', 'EMOTIONAL', 'JUDGMENT', 'AVOIDANCE', 'OTHER'];
const emotions: Emotion[] = ['ANXIETY', 'GUILT', 'EMBARRASSMENT', 'RESTLESSNESS', 'HELPLESSNESS', 'ANGER', 'SADNESS', 'OTHER'];
const TOTAL_STEPS = 3;

const STEPS = [
  { label: 'Crafting the\nNarrative', desc: 'Documenting social deviations with precision. Select your context and refine the delivery.' },
  { label: 'Root\nAnalysis', desc: '왜 그렇게 행동했는지 원인과 감정을 분석하세요' },
  { label: 'Forward\nPlanning', desc: '개선 계획을 세워 다음엔 더 나은 선택을 하세요' },
];

const STEP_LABELS = ['Context', 'Details', 'Review'];

function StepIndicator({ step }: { step: number }) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
      {STEP_LABELS.map((label, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', flex: i < 2 ? undefined : 0 }}>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
              backgroundColor: i === step ? '#cce8e4' : c.containerHigh,
            }}>
              <Text style={{
                fontFamily: 'Manrope_700Bold', fontSize: 14, textAlign: 'center',
                color: i === step ? '#3d5654' : c.textSecondary,
              }}>
                {i + 1}
              </Text>
            </View>
            <Text style={{
              fontFamily: 'Manrope_700Bold', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1,
              color: i === step ? '#2e6863' : `rgba(88,96,104,${i < step ? 0.8 : 0.6})`,
            }}>
              {label}
            </Text>
          </View>
          {i < 2 && (
            <View style={{ flex: 1, height: 1, marginHorizontal: 16, marginBottom: 24, backgroundColor: i < step ? 'rgba(204,232,228,0.5)' : 'rgba(227,233,241,0.5)' }} />
          )}
        </View>
      ))}
    </View>
  );
}

function SectionLabel({ icon, label }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; label: string }) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <MaterialCommunityIcons name={icon} size={20} color={c.textSecondary} />
      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 12, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 }}>
        {label}
      </Text>
    </View>
  );
}

function Textarea({ placeholder, value, onChangeText, error }: {
  placeholder: string; value: string; onChangeText: (v: string) => void; error?: string;
}) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: error ? 8 : 0 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="rgba(88,96,104,0.4)"
        multiline
        numberOfLines={4}
        style={{
          backgroundColor: c.section,
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 20,
          paddingBottom: 44,
          color: c.textPrimary,
          fontFamily: 'Manrope_400Regular',
          fontSize: 16,
          lineHeight: 24,
          textAlignVertical: 'top',
          minHeight: 120,
          borderWidth: focused ? 1.5 : 0,
          borderColor: '#2e6863' + '40',
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
        }}
      />
      {error && <Text style={{ fontFamily: 'Manrope_400Regular', color: c.error, fontSize: 11, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

function SingleLineInput({ placeholder, value, onChangeText, error }: {
  placeholder: string; value: string; onChangeText: (v: string) => void; error?: string;
}) {
  const c = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: error ? 8 : 0 }}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor="rgba(88,96,104,0.4)"
        style={{
          backgroundColor: c.section,
          borderRadius: 8,
          paddingHorizontal: 20,
          paddingVertical: 21,
          color: c.textPrimary,
          fontFamily: 'Manrope_400Regular',
          fontSize: 16,
          borderWidth: focused ? 1.5 : 0,
          borderColor: '#2e6863' + '40',
        }}
      />
      {error && <Text style={{ fontFamily: 'Manrope_400Regular', color: c.error, fontSize: 11, marginTop: 4 }}>{error}</Text>}
    </View>
  );
}

export default function RecordCreateScreen() {
  const c = useTheme();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState<CreateRecordRequest>({
    occurredAt: new Date().toISOString(),
    situation: '', myAction: '', result: '', cause: '',
    nextAction: '', recurrenceTrigger: '', recurrenceAction: '',
    mistakeType: undefined, emotion: undefined, intensityLevel: 3,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: CreateRecordRequest) => apiClient.createRecord(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['records'] }); router.back(); },
    onError: (error) => Alert.alert('저장 실패', getErrorMessage(error)),
  });

  const update = (field: keyof CreateRecordRequest, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!formData.situation.trim()) e.situation = '상황을 입력해주세요';
      if (!formData.myAction.trim()) e.myAction = '내 대처를 입력해주세요';
      if (!formData.result.trim()) e.result = '결과를 입력해주세요';
    } else if (s === 1) {
      if (!formData.cause.trim()) e.cause = '원인을 입력해주세요';
    } else if (s === 2) {
      if (!formData.nextAction.trim()) e.nextAction = '다음 행동을 입력해주세요';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const intensityColor = ['', '#4ade80', '#4ade80', '#facc15', '#fb923c', '#f87171'];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Header */}
      <View style={{
        height: 64, backgroundColor: c.bg,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24,
      }}>
        <MaterialCommunityIcons name="menu" size={22} color={c.textPrimary} />
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#2e6863', letterSpacing: 0.8, textTransform: 'uppercase' }}>
          EXCUSE ARCHIVE
        </Text>
        <MaterialCommunityIcons name="magnify" size={22} color={c.textPrimary} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 180 }}
      >
        {/* Editorial Header */}
        <View style={{ marginBottom: 48, gap: 8 }}>
          {/* NEW ENTRY label + divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0, height: 24 }}>
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#2e6863', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              New Entry
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(171,179,188,0.2)', marginLeft: 16, alignSelf: 'center' }} />
          </View>

          {/* Main heading */}
          <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: 36, color: c.textPrimary, letterSpacing: -0.9, lineHeight: 40 }}>
            {STEPS[step].label}
          </Text>

          {/* Description */}
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 16, color: c.textSecondary, lineHeight: 26, fontWeight: '300' }}>
            {STEPS[step].desc}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={{ marginBottom: 48 + 16 }}>
          <StepIndicator step={step} />
        </View>

        {/* Form Sections */}
        <View style={{ gap: 48, paddingTop: 16 }}>

          {/* Step 1: Context */}
          {step === 0 && (
            <>
              {/* The Situation */}
              <View>
                <SectionLabel icon="theater" label="The Situation" />
                <Textarea
                  placeholder={'What event are you currently avoiding?\nDescribe the social pressure point...'}
                  value={formData.situation}
                  onChangeText={(v) => update('situation', v)}
                  error={errors.situation}
                />
              </View>

              {/* Proposed Action */}
              <View>
                <SectionLabel icon="auto-fix" label="Proposed Action" />
                <View style={{ gap: 16, marginBottom: 16 }}>
                  {/* Card 1: Mental Health Day */}
                  <Pressable
                    onPress={() => update('myAction', formData.myAction === 'mental_health' ? '' : 'mental_health')}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 8, padding: 20,
                      flexDirection: 'row', alignItems: 'center', gap: 16,
                      shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.04, shadowRadius: 30, elevation: 2,
                      borderWidth: formData.myAction === 'mental_health' ? 1 : 0,
                      borderColor: 'rgba(46,104,99,0.2)',
                    }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(204,232,228,0.3)', alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons name="heart-pulse" size={18} color="#2e6863" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: c.textPrimary }}>{`The 'Mental Health' Day`}</Text>
                      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textSecondary }}>Gentle, undeniable, modern.</Text>
                    </View>
                  </Pressable>

                  {/* Card 2: Urgent Matter */}
                  <Pressable
                    onPress={() => update('myAction', formData.myAction === 'urgent_matter' ? '' : 'urgent_matter')}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 8, padding: 20,
                      flexDirection: 'row', alignItems: 'center', gap: 16,
                      shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.04, shadowRadius: 30, elevation: 2,
                      borderWidth: formData.myAction === 'urgent_matter' ? 1 : 0,
                      borderColor: 'rgba(46,104,99,0.2)',
                    }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#b3eee7', alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons name="lightning-bolt" size={16} color="#2e6863" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: c.textPrimary }}>{`The 'Urgent Matter'`}</Text>
                      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textSecondary }}>Vague but implies high stakes.</Text>
                    </View>
                  </Pressable>
                </View>

                {/* Custom input */}
                <SingleLineInput
                  placeholder="Or define a custom response protocol..."
                  value={['mental_health', 'urgent_matter'].includes(formData.myAction) ? '' : formData.myAction}
                  onChangeText={(v) => update('myAction', v)}
                  error={errors.myAction}
                />
              </View>

              {/* Anticipated Result */}
              <View>
                <SectionLabel icon="chart-line" label="Anticipated Result" />
                <View style={{ backgroundColor: c.section, borderRadius: 16, padding: 0, overflow: 'hidden' }}>
                  <View style={{ padding: 24, paddingBottom: 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: c.textSecondary }}>Projected Success Rate</Text>
                      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#2e6863' }}>84%</Text>
                    </View>
                    {/* Progress bar */}
                    <View style={{ height: 8, backgroundColor: c.containerHigh, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                      <View style={{ height: '100%', width: '84%', backgroundColor: '#2e6863', borderRadius: 12 }} />
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textSecondary, lineHeight: 19.5 }}>
                      "Based on historical data for this audience, a vague urgent matter yields minimal follow-up questions."
                    </Text>
                  </View>
                </View>
              </View>

              {/* Result field */}
              <View>
                <SectionLabel icon="flag-outline" label="Actual Result" />
                <Textarea
                  placeholder="최종적으로 어떤 결과가 나왔나요?"
                  value={formData.result}
                  onChangeText={(v) => update('result', v)}
                  error={errors.result}
                />
              </View>

              {/* Decorative card */}
              <View style={{ backgroundColor: '#2e6863', borderRadius: 24, padding: 32, overflow: 'hidden' }}>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#b3eee7', marginBottom: 4 }}>
                  Archival Wisdom
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 }}>
                  The best excuse is the one that allows both parties to maintain their dignity.
                </Text>
              </View>
            </>
          )}

          {/* Step 2: Details */}
          {step === 1 && (
            <>
              <View>
                <SectionLabel icon="magnify" label="Root Cause" />
                <Textarea
                  placeholder="왜 그렇게 행동했을까요?"
                  value={formData.cause}
                  onChangeText={(v) => update('cause', v)}
                  error={errors.cause}
                />
              </View>

              {/* Mistake Type */}
              <View>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 12, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>
                  실수 유형 (선택)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {mistakeTypes.map((type) => {
                    const active = formData.mistakeType === type;
                    return (
                      <Pressable
                        key={type}
                        onPress={() => update('mistakeType', active ? undefined : type)}
                        style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9999, backgroundColor: active ? '#cce8e4' : c.section }}
                      >
                        <Text style={{ fontFamily: 'Manrope_400Regular', color: active ? '#2e6863' : c.textSecondary, fontSize: 13 }}>
                          {MISTAKE_TYPE_LABELS[type]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Emotion */}
              <View>
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 12, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>
                  감정 (선택)
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {emotions.map((emotion) => {
                    const active = formData.emotion === emotion;
                    return (
                      <Pressable
                        key={emotion}
                        onPress={() => update('emotion', active ? undefined : emotion)}
                        style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9999, backgroundColor: active ? '#cce8e4' : c.section }}
                      >
                        <Text style={{ fontFamily: 'Manrope_400Regular', color: active ? '#2e6863' : c.textSecondary, fontSize: 13 }}>
                          {EMOTION_LABELS[emotion]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Intensity */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 12, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                    강도 (선택)
                  </Text>
                  <Text style={{ fontFamily: 'Manrope_500Medium', color: intensityColor[formData.intensityLevel ?? 3], fontSize: 12 }}>
                    {formData.intensityLevel} / 5
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Pressable
                      key={v}
                      onPress={() => update('intensityLevel', v)}
                      style={{
                        flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
                        backgroundColor: formData.intensityLevel === v ? intensityColor[v] + '25' : c.section,
                        borderWidth: formData.intensityLevel === v ? 1.5 : 0,
                        borderColor: intensityColor[v],
                      }}
                    >
                      <Text style={{ fontFamily: 'Manrope_700Bold', color: intensityColor[v], fontSize: 15 }}>{v}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Step 3: Review */}
          {step === 2 && (
            <>
              <View>
                <SectionLabel icon="arrow-right-circle-outline" label="Next Action" />
                <Textarea
                  placeholder="다음에는 어떻게 할 건가요?"
                  value={formData.nextAction}
                  onChangeText={(v) => update('nextAction', v)}
                  error={errors.nextAction}
                />
              </View>
              <View>
                <SectionLabel icon="lightning-bolt-outline" label="Recurrence Trigger" />
                <SingleLineInput
                  placeholder="예: 회의 직후, 오전 업무 시작"
                  value={formData.recurrenceTrigger ?? ''}
                  onChangeText={(v) => update('recurrenceTrigger', v)}
                />
              </View>
              <View>
                <SectionLabel icon="shield-check-outline" label="Prevention Strategy" />
                <SingleLineInput
                  placeholder="예: 타이머 10분 설정"
                  value={formData.recurrenceAction ?? ''}
                  onChangeText={(v) => update('recurrenceAction', v)}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer Action Bar */}
      <View style={{
        position: 'absolute', bottom: 80, left: 0, right: 0, paddingHorizontal: 24,
      }}>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 16, padding: 17,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          borderWidth: 1, borderColor: 'rgba(171,179,188,0.1)',
          shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
          shadowOpacity: 0.1, shadowRadius: 25, elevation: 8,
        }}>
          {/* Cancel / Back */}
          <Pressable
            onPress={() => { if (step === 0) router.back(); else setStep((s) => s - 1); }}
            style={{ borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
          >
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: c.textSecondary, textAlign: 'center' }}>
              {step === 0 ? 'Cancel' : 'Back'}
            </Text>
          </Pressable>

          {/* Continue / Save */}
          {step < 2 ? (
            <Pressable
              onPress={() => { if (validate(step)) setStep((s) => s + 1); }}
              style={{
                backgroundColor: '#2e6863', borderRadius: 12,
                paddingHorizontal: 32, paddingVertical: 12,
                flexDirection: 'row', alignItems: 'center', gap: 8,
                shadowColor: '#2e6863', shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2, shadowRadius: 15, elevation: 4,
              }}
            >
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#e1fffb', textAlign: 'center' }}>Continue</Text>
              <MaterialCommunityIcons name="chevron-right" size={14} color="#e1fffb" />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => {
                if (!validate(2)) return;
                mutation.mutate({
                  ...formData,
                  recurrenceTrigger: formData.recurrenceTrigger || undefined,
                  recurrenceAction: formData.recurrenceAction || undefined,
                });
              }}
              disabled={mutation.isPending}
              style={{
                backgroundColor: '#2e6863', borderRadius: 12,
                paddingHorizontal: 32, paddingVertical: 12,
                shadowColor: '#2e6863', shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2, shadowRadius: 15, elevation: 4,
              }}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#e1fffb', textAlign: 'center' }}>Save to Archive</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
