import { z } from 'zod';

// 실수 유형 enum
export const MistakeTypeSchema = z.enum([
  'PROCRASTINATION',
  'TIME_MANAGEMENT',
  'COMMUNICATION',
  'FOCUS',
  'EMOTIONAL',
  'JUDGMENT',
  'AVOIDANCE',
  'OTHER',
]);

// 감정 enum
export const EmotionSchema = z.enum([
  'ANXIETY',
  'GUILT',
  'EMBARRASSMENT',
  'RESTLESSNESS',
  'HELPLESSNESS',
  'ANGER',
  'SADNESS',
  'OTHER',
]);

// 기록 생성 스키마
export const CreateRecordSchema = z.object({
  occurredAt: z.string().min(1, '발생 일시를 입력해주세요'),
  situation: z.string().min(1, '상황을 입력해주세요').max(500, '500자 이내로 입력해주세요'),
  myAction: z.string().min(1, '내 행동을 입력해주세요').max(500, '500자 이내로 입력해주세요'),
  result: z.string().min(1, '결과를 입력해주세요').max(500, '500자 이내로 입력해주세요'),
  cause: z.string().min(1, '원인을 입력해주세요').max(500, '500자 이내로 입력해주세요'),
  nextAction: z.string().min(1, '다음 행동을 입력해주세요').max(500, '500자 이내로 입력해주세요'),
  recurrenceTrigger: z.string().max(200).optional(),
  recurrenceAction: z.string().max(200).optional(),
  mistakeType: MistakeTypeSchema.optional(),
  emotion: EmotionSchema.optional(),
  intensityLevel: z.number().min(1).max(5).optional(),
});

// 기록 수정 스키마
export const UpdateRecordSchema = z.object({
  occurredAt: z.string().min(1).optional(),
  situation: z.string().min(1).max(500).optional(),
  myAction: z.string().min(1).max(500).optional(),
  result: z.string().min(1).max(500).optional(),
  cause: z.string().min(1).max(500).optional(),
  nextAction: z.string().min(1).max(500).optional(),
  nextActionDone: z.boolean().optional(),
  recurrenceTrigger: z.string().max(200).optional(),
  recurrenceAction: z.string().max(200).optional(),
  mistakeType: MistakeTypeSchema.optional(),
  emotion: EmotionSchema.optional(),
  intensityLevel: z.number().min(1).max(5).optional(),
});

export type CreateRecordInput = z.infer<typeof CreateRecordSchema>;
export type UpdateRecordInput = z.infer<typeof UpdateRecordSchema>;
