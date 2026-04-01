// 실수 유형
export type MistakeType =
  | 'PROCRASTINATION'
  | 'TIME_MANAGEMENT'
  | 'COMMUNICATION'
  | 'FOCUS'
  | 'EMOTIONAL'
  | 'JUDGMENT'
  | 'AVOIDANCE'
  | 'OTHER';

// 감정 유형
export type Emotion =
  | 'ANXIETY'
  | 'GUILT'
  | 'EMBARRASSMENT'
  | 'RESTLESSNESS'
  | 'HELPLESSNESS'
  | 'ANGER'
  | 'SADNESS'
  | 'OTHER';

// 기록 인터페이스
export interface Record {
  id: number;
  occurredAt: string;
  situation: string;
  myAction: string;
  result: string;
  cause: string;
  nextAction: string;
  nextActionDone: boolean;
  recurrenceTrigger?: string;
  recurrenceAction?: string;
  mistakeType?: MistakeType;
  emotion?: Emotion;
  intensityLevel?: number;
  createdAt: string;
  updatedAt: string;
}

// 기록 생성 요청
export interface CreateRecordRequest {
  occurredAt: string;
  situation: string;
  myAction: string;
  result: string;
  cause: string;
  nextAction: string;
  recurrenceTrigger?: string;
  recurrenceAction?: string;
  mistakeType?: MistakeType;
  emotion?: Emotion;
  intensityLevel?: number;
}

// 기록 수정 요청
export interface UpdateRecordRequest {
  occurredAt?: string;
  situation?: string;
  myAction?: string;
  result?: string;
  cause?: string;
  nextAction?: string;
  nextActionDone?: boolean;
  recurrenceTrigger?: string;
  recurrenceAction?: string;
  mistakeType?: MistakeType;
  emotion?: Emotion;
  intensityLevel?: number;
}

// 인증 응답
export interface AuthResponse {
  accessToken: string;
  externalId: string;
}

// 로그인 요청
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청
export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

// 페이지네이션 응답
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 패턴 리포트 항목
export interface PatternItem {
  key: string;
  count: number;
}

// 패턴 리포트 응답
export interface PatternReportResponse {
  days: number;
  since: string;
  generatedAt: string;
  topMistakeTypes: PatternItem[];
  topEmotions: PatternItem[];
  topTriggers: PatternItem[];
}

// API 에러 응답
export interface ApiError {
  error: string;
  blockedKeywords?: string[];
}

// 실수 유형 라벨
export const MISTAKE_TYPE_LABELS: { [K in MistakeType]: string } = {
  PROCRASTINATION: '미루기',
  TIME_MANAGEMENT: '시간관리',
  COMMUNICATION: '소통',
  FOCUS: '집중력',
  EMOTIONAL: '감정조절',
  JUDGMENT: '판단',
  AVOIDANCE: '회피',
  OTHER: '기타',
};

// 감정 라벨
export const EMOTION_LABELS: { [K in Emotion]: string } = {
  ANXIETY: '불안',
  GUILT: '죄책감',
  EMBARRASSMENT: '창피함',
  RESTLESSNESS: '초조함',
  HELPLESSNESS: '무력감',
  ANGER: '분노',
  SADNESS: '슬픔',
  OTHER: '기타',
};
