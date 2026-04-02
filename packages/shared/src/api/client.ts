import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Record,
  CreateRecordRequest,
  UpdateRecordRequest,
  PageResponse,
  PatternReportResponse,
  UserProfile,
  ApiError,
} from '../types';

export interface ApiClientConfig {
  baseURL: string;
  getToken: () => string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 요청 인터셉터: 토큰 추가
    this.client.interceptors.request.use((req) => {
      const token = this.config.getToken();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    });

    // 응답 인터셉터: 에러 처리
    this.client.interceptors.response.use(
      (res) => res,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          this.config.clearToken();
          this.config.onUnauthorized?.();
        }
        return Promise.reject(error);
      }
    );
  }

  // 익명 인증
  async authenticateAnonymous(): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/anonymous', {});
    this.config.setToken(data.accessToken);
    return data;
  }

  // 회원가입
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/register', request);
    this.config.setToken(data.accessToken);
    return data;
  }

  // 로그인
  async login(request: LoginRequest): Promise<AuthResponse> {
    const { data } = await this.client.post<AuthResponse>('/auth/login', request);
    this.config.setToken(data.accessToken);
    return data;
  }

  // 기록 생성
  async createRecord(request: CreateRecordRequest): Promise<Record> {
    const { data } = await this.client.post<Record>('/records', request);
    return data;
  }

  // 기록 목록 조회
  async getRecords(page = 0, size = 10): Promise<PageResponse<Record>> {
    const { data } = await this.client.get<PageResponse<Record>>('/records', {
      params: { page, size },
    });
    return data;
  }

  // 기록 상세 조회
  async getRecord(id: number): Promise<Record> {
    const { data } = await this.client.get<Record>(`/records/${id}`);
    return data;
  }

  // 기록 수정
  async updateRecord(id: number, request: UpdateRecordRequest): Promise<Record> {
    const { data } = await this.client.patch<Record>(`/records/${id}`, request);
    return data;
  }

  // 기록 삭제
  async deleteRecord(id: number): Promise<void> {
    await this.client.delete(`/records/${id}`);
  }

  // 내 프로필 조회
  async getMe(): Promise<UserProfile> {
    const { data } = await this.client.get<UserProfile>('/auth/me');
    return data;
  }

  // 닉네임 수정
  async updateDisplayName(displayName: string): Promise<void> {
    await this.client.patch('/auth/me', { displayName });
  }

  // 패턴 리포트 조회
  async getPatternReport(days: 7 | 30 = 7): Promise<PatternReportResponse> {
    const { data } = await this.client.get<PatternReportResponse>('/reports/patterns', {
      params: { days },
    });
    return data;
  }
}

// 에러 유틸리티
export function isApiError(error: unknown): error is AxiosError<ApiError> {
  return axios.isAxiosError(error);
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    const status = error.response?.status;
    const apiError = error.response?.data;

    switch (status) {
      case 401:
        return '인증이 만료되었습니다. 다시 시작해주세요.';
      case 404:
        return '기록을 찾을 수 없습니다.';
      case 422:
        return apiError?.error || '저장할 수 없는 내용이 포함되어 있습니다.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return apiError?.error || '알 수 없는 오류가 발생했습니다.';
    }
  }
  return '네트워크 오류가 발생했습니다.';
}
