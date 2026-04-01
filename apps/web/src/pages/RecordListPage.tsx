import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { MISTAKE_TYPE_LABELS, EMOTION_LABELS } from '@excuse-archive/shared';
import type { Record } from '@excuse-archive/shared';

type FilterType = 'all' | 'pending';

function RecordCard({ record }: { record: Record }) {
  return (
    <Link
      to={`/records/${record.id}`}
      className="block bg-dark-600 rounded-xl border border-border/75 p-4 hover:border-primary-500/50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-primary font-medium">{record.situation}</p>
          <p className="text-text-secondary text-sm mt-1">{record.myAction}</p>
        </div>
        {record.nextActionDone ? (
          <span className="ml-2 px-2 py-1 bg-primary-500/25 text-primary-400 text-xs rounded-full border border-border/70 flex-shrink-0">
            완료
          </span>
        ) : (
          <span className="ml-2 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full border border-orange-500/30 flex-shrink-0">
            미완료
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted flex-wrap">
        {record.mistakeType && (
          <span className="px-2 py-0.5 bg-dark-700 rounded border border-border/55">
            {MISTAKE_TYPE_LABELS[record.mistakeType]}
          </span>
        )}
        {record.emotion && (
          <span className="px-2 py-0.5 bg-dark-700 rounded border border-border/55">
            {EMOTION_LABELS[record.emotion]}
          </span>
        )}
        <span className="ml-auto text-text-secondary">
          {new Date(record.occurredAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="mt-3 text-sm text-text-secondary">
        <span className="text-primary-400">다음 행동:</span> {record.nextAction}
      </div>
    </Link>
  );
}

export default function RecordListPage() {
  const { token } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterType>(
    searchParams.get('filter') === 'pending' ? 'pending' : 'all'
  );
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (searchParams.get('filter') === 'pending') {
      setFilter('pending');
    }
  }, [searchParams]);

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

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setPage(0);
    if (f === 'pending') {
      setSearchParams({ filter: 'pending' });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">내 기록</h1>
        <Link
          to="/records/new"
          className="bg-primary-500/20 text-primary-400 px-4 py-2 rounded-xl text-sm font-medium border border-primary-500/50 hover:bg-primary-500/30 transition-colors"
        >
          + 새 기록
        </Link>
      </div>

      {/* 필터 탭 */}
      <div className="flex bg-dark-600 rounded-xl p-1 border border-border/70 w-fit">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-dark-700 text-text-primary border border-border/70'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => handleFilterChange('pending')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-dark-700 text-orange-400 border border-border/70'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          미완료
        </button>
      </div>

      <div className="bg-dark-700 rounded-2xl border border-border/70 p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-dark-600 rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : displayRecords.length === 0 ? (
          <div className="text-center py-16">
            {filter === 'pending' ? (
              <>
                <p className="text-4xl mb-4">🎉</p>
                <p className="text-text-primary font-medium mb-2">미완료 행동이 없어요</p>
                <p className="text-text-secondary text-sm">모든 다음 행동을 완료했습니다</p>
              </>
            ) : (
              <>
                <p className="text-text-secondary mb-4">아직 기록이 없습니다</p>
                <Link to="/records/new" className="text-primary-400 hover:text-primary-300 font-medium">
                  첫 기록 작성하기
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>

            {filter === 'all' && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm rounded-xl bg-dark-600 border border-border/75 text-text-secondary disabled:opacity-30 hover:bg-dark-800 transition-colors"
                >
                  이전
                </button>
                <span className="text-sm text-text-secondary px-4">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm rounded-xl bg-dark-600 border border-border/75 text-text-secondary disabled:opacity-30 hover:bg-dark-800 transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
