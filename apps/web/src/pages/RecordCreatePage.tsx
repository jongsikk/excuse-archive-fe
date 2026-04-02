import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { getErrorMessage } from '@excuse-archive/shared';
import type { CreateRecordRequest, MistakeType, Emotion } from '@excuse-archive/shared';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';

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

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                i < current
                  ? 'bg-primary-500 border-primary-500 text-dark-900'
                  : i === current
                    ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                    : 'bg-elevated border-border/70 text-text-muted'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium ${
                i === current ? 'text-primary-400' : 'text-text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 flex-1 mb-4 transition-colors ${
                i < current ? 'bg-primary-500' : 'bg-border/50'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Textarea({
  label,
  required,
  name,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  required?: boolean;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className={`w-full px-4 py-3 bg-elevated border rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 outline-none resize-none transition-colors ${
          error ? 'border-accent' : 'border-border/75'
        }`}
      />
      {error && <p className="mt-1 text-sm text-accent">{error}</p>}
    </div>
  );
}

export default function RecordCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState<CreateRecordRequest>({
    occurredAt: new Date().toISOString().slice(0, 16),
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
      navigate('/records');
    },
    onError: (error) => {
      setErrors({ submit: getErrorMessage(error) });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
    if (step === 0) navigate(-1);
    else setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(2)) return;
    const submitData = {
      ...formData,
      occurredAt: new Date(formData.occurredAt).toISOString(),
      recurrenceTrigger: formData.recurrenceTrigger || undefined,
      recurrenceAction: formData.recurrenceAction || undefined,
    };
    mutation.mutate(submitData);
  };

  const intensityLabels: Record<number, string> = {
    1: '매우 약함',
    2: '약함',
    3: '보통',
    4: '강함',
    5: '매우 강함',
  };

  const intensityColors: Record<number, string> = {
    1: 'text-emerald-400',
    2: 'text-emerald-400',
    3: 'text-yellow-400',
    4: 'text-orange-400',
    5: 'text-red-400',
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBack} className="text-text-muted hover:text-text-primary transition-colors text-lg">
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold text-text-primary">Crafting the Narrative</h1>
          <p className="text-xs text-text-muted">{STEPS[step].desc}</p>
        </div>
      </div>

      <StepIndicator current={step} />

      {errors.submit && (
        <div className="mb-4 bg-accent/10 border border-accent/40 text-accent px-4 py-3 rounded-xl text-sm">
          {errors.submit}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/60 p-6 space-y-5">
        {/* Step 1: 무슨 일이? */}
        {step === 0 && (
          <>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">발생 일시</label>
              <input
                type="datetime-local"
                name="occurredAt"
                value={formData.occurredAt}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-elevated border border-border/60 rounded-xl text-text-primary focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 outline-none"
              />
            </div>
            <Textarea
              label="상황"
              required
              name="situation"
              value={formData.situation}
              onChange={handleChange}
              placeholder="어떤 상황이었나요?"
              error={errors.situation}
            />
            <Textarea
              label="내 행동"
              required
              name="myAction"
              value={formData.myAction}
              onChange={handleChange}
              placeholder="나는 어떻게 행동했나요?"
              error={errors.myAction}
            />
            <Textarea
              label="결과"
              required
              name="result"
              value={formData.result}
              onChange={handleChange}
              placeholder="어떤 결과가 있었나요?"
              error={errors.result}
            />
          </>
        )}

        {/* Step 2: 왜 그랬지? */}
        {step === 1 && (
          <>
            <Textarea
              label="원인"
              required
              name="cause"
              value={formData.cause}
              onChange={handleChange}
              placeholder="왜 그렇게 행동했을까요?"
              error={errors.cause}
            />

            <div>
              <label className="block text-sm text-text-muted mb-3">실수 유형 (선택)</label>
              <div className="flex flex-wrap gap-2">
                {mistakeTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        mistakeType: prev.mistakeType === type ? undefined : type,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.mistakeType === type
                        ? 'bg-primary-500/25 border-primary-500/70 text-primary-400'
                        : 'bg-elevated border-border/60 text-text-secondary hover:border-border'
                    }`}
                  >
                    {MISTAKE_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-3">감정 (선택)</label>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion) => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        emotion: prev.emotion === emotion ? undefined : emotion,
                      }))
                    }
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.emotion === emotion
                        ? 'bg-purple-500/25 border-purple-500/70 text-purple-400'
                        : 'bg-elevated border-border/60 text-text-secondary hover:border-border'
                    }`}
                  >
                    {EMOTION_LABELS[emotion]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-3">
                강도 (선택):{' '}
                <span className={`font-semibold ${intensityColors[formData.intensityLevel ?? 3]}`}>
                  {formData.intensityLevel} — {intensityLabels[formData.intensityLevel ?? 3]}
                </span>
              </label>
              <input
                type="range"
                name="intensityLevel"
                min="1"
                max="5"
                value={formData.intensityLevel}
                onChange={handleChange}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>
          </>
        )}

        {/* Step 3: 다음엔? */}
        {step === 2 && (
          <>
            <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4 text-sm text-primary-400/80">
              💡 칭찬/성과/요약 금지. '실수/후회'만 기록합니다.
            </div>
            <Textarea
              label="다음 행동"
              required
              name="nextAction"
              value={formData.nextAction}
              onChange={handleChange}
              placeholder="다음에는 어떻게 할 건가요? (내가 통제할 수 있는 행동)"
              error={errors.nextAction}
            />
            <div>
              <label className="block text-sm text-text-muted mb-2">재발 트리거 (선택)</label>
              <input
                type="text"
                name="recurrenceTrigger"
                value={formData.recurrenceTrigger}
                onChange={handleChange}
                placeholder="예: 회의 직후, 오전 업무 시작"
                className="w-full px-4 py-3 bg-elevated border border-border/60 rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">재발 방지 행동 (선택)</label>
              <input
                type="text"
                name="recurrenceAction"
                value={formData.recurrenceAction}
                onChange={handleChange}
                placeholder="예: 타이머 10분 + 미처리 건 1개만"
                className="w-full px-4 py-3 bg-elevated border border-border/60 rounded-xl text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 outline-none"
              />
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={handleBack}
          className="flex-1 px-4 py-3 bg-elevated border border-border/60 text-text-secondary rounded-xl font-medium hover:bg-card transition-colors"
        >
          {step === 0 ? '취소' : '이전'}
        </button>
        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 px-4 py-3 bg-primary-500/20 border border-primary-500/50 text-primary-400 rounded-xl font-medium hover:bg-primary-500/30 transition-colors"
          >
            다음 →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex-1 px-4 py-3 bg-accent/20 border border-accent/50 text-accent rounded-xl font-medium hover:bg-accent/30 transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? '저장 중...' : '저장하기'}
          </button>
        )}
      </div>
    </div>
  );
}
