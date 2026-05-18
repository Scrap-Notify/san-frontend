import { FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useArchiveCategories } from '@san/shared';
import { ContentEmptyState } from '../../../components/shared/empty/ContentEmptyState';

export function ArchiveFolderGrid() {
  const navigate = useNavigate();
  const archiveCategoriesQuery = useArchiveCategories();
  const categories = archiveCategoriesQuery.data?.categories ?? [];

  return (
    <section className="flex flex-col gap-6">
      {archiveCategoriesQuery.isPending ? (
        <p className="py-10 text-sm text-white/40">폴더를 불러오는 중입니다...</p>
      ) : archiveCategoriesQuery.isError ? (
        <p className="py-10 text-sm text-red-400">폴더를 불러오지 못했습니다.</p>
      ) : categories.length === 0 ? (
        <ContentEmptyState
          title="아직 보관된 카드가 없습니다"
          description="지식카드가 쌓이면 카테고리별 폴더가 이곳에 생깁니다."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.categoryId}
              type="button"
              onClick={() => navigate(`/archive/${category.categoryId}`)}
              className="group flex min-h-[180px] flex-col justify-between rounded-[32px] border border-white/5 bg-[#131718] p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-action-accent/30 hover:bg-[#161a1b]"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-action-accent/10 text-action-accent">
                  <FolderOpen size={22} />
                </div>
                <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs font-bold text-white/45">
                  {category.cardCount} CARDS
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white transition-colors group-hover:text-action-accent">
                  {category.categoryName}
                </h3>
                <p className="mt-2 text-sm text-white/35">폴더 열기</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
