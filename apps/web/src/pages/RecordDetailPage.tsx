import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '../lib/api';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      navigate('/records');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-dark-600 h-8 w-48 rounded animate-pulse" />
        <div className="bg-dark-600 h-64 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">기록을 찾을 수 없습니다</p>
        <button
          onClick={() => navigate('/records')}
          className="mt-4 text-primary-400 hover:text-primary-300"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          ← 뒤로
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-3 py-1 text-sm text-accent hover:bg-accent-light rounded-lg transition-colors"
        >
          삭제
        </button>
      </div>

      {/* 기록 내용 */}
      <div className="bg-dark-700 rounded-2xl border border-border/70 overflow-hidden">
        {/* 메타 정보 */}
        <div className="px-6 py-4 border-b border-border/50 bg-dark-600/50">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {record.mistakeType && (
                <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs rounded-full border border-border/70">
                  {MISTAKE_TYPE_LABELS[record.mistakeType]}
                </span>
              )}
              {record.emotion && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-border/70">
                  {EMOTION_LABELS[record.emotion]}
                </span>
              )}
              {record.intensityLevel && (
                <span className="px-3 py-1 bg-dark-600 text-text-secondary text-xs rounded-full border border-border/70">
                  강도 {record.intensityLevel}/5
                </span>
              )}
            </div>
            <span className="text-sm text-text-secondary">
              {new Date(record.occurredAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>

        {/* 본문 */}
        <div className="px-6 py-6 space-y-6">
          <section>
            <h3 className="text-sm font-medium text-text-muted mb-2">상황</h3>
            <p className="text-text-primary">{record.situation}</p>
          </section>

          <section>
            <h3 className="text-sm font-medium text-text-muted mb-2">내 행동</h3>
            <p className="text-text-primary">{record.myAction}</p>
          </section>

          <section>
            <h3 className="text-sm font-medium text-text-muted mb-2">결과</h3>
            <p className="text-text-primary">{record.result}</p>
          </section>

          <section>
            <h3 className="text-sm font-medium text-text-muted mb-2">원인</h3>
            <p className="text-text-primary">{record.cause}</p>
          </section>

          {/* 다음 행동 - 토글 가능 */}
          <section className="bg-primary-500/10 -mx-6 px-6 py-4 border-y border-primary-500/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-primary-400 mb-2">다음 행동</h3>
                <p className="text-text-primary">{record.nextAction}</p>
              </div>
              <button
                onClick={() => toggleMutation.mutate(!record.nextActionDone)}
                disabled={toggleMutation.isPending}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  record.nextActionDone
                    ? 'bg-primary-500/25 border-primary-500/70 text-primary-400'
                    : 'bg-dark-600 border-border/75 text-text-secondary hover:border-border'
                }`}
              >
                {record.nextActionDone ? '완료됨 ✓' : '완료하기'}
              </button>
            </div>
          </section>

          {/* 재발 방지 정보 */}
          {(record.recurrenceTrigger || record.recurrenceAction) && (
            <section className="pt-2">
              <h3 className="text-sm font-medium text-text-muted mb-3">재발 방지</h3>
              <div className="space-y-2">
                {record.recurrenceTrigger && (
                  <p className="text-sm">
                    <span className="text-text-muted">트리거:</span>{' '}
                    <span className="text-text-primary">{record.recurrenceTrigger}</span>
                  </p>
                )}
                {record.recurrenceAction && (
                  <p className="text-sm">
                    <span className="text-text-muted">방지 행동:</span>{' '}
                    <span className="text-text-primary">{record.recurrenceAction}</span>
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-dark-900/80 flex items-center justify-center z-50">
          <div className="bg-dark-700 rounded-2xl border border-border/70 p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-2">기록 삭제</h3>
            <p className="text-text-secondary mb-6">
              이 기록을 삭제하시겠습니까? 삭제된 기록은 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-dark-600 border border-border/75 text-text-secondary rounded-xl hover:bg-dark-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-accent-light border border-accent/60 text-accent rounded-xl hover:bg-accent/40 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
