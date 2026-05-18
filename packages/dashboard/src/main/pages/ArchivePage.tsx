import { FolderOpen, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useArchiveCategories } from '@san/shared';
import { ContentEmptyState } from '../../components/shared/empty/ContentEmptyState';

export function ArchivePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('query')?.trim() ?? '';
  const categoriesQuery = useArchiveCategories();

  if (keyword) {
    return (
      <section className="flex w-full min-w-0 flex-col gap-8 py-12 text-white">
        <header className="flex flex-col gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight">Archive</h1>
          <p className="text-white/50">??? ???? ??? ? ??????. ?? ??? ?????.</p>
        </header>
        <div className="rounded-[32px] border border-white/5 bg-[#131718] p-8">
          <div className="mb-3 flex items-center gap-3 text-action-accent">
            <Search size={18} />
            <span className="text-sm font-bold">?{keyword}? ?? ???</span>
          </div>
          <p className="text-sm text-white/45">?? ???? ??? ?? ?? ???? ???? ??? ? ? ?? ??? ? ? ????.</p>
        </div>
        <CategoryGrid
          categories={categoriesQuery.data?.categories ?? []}
          isPending={categoriesQuery.isPending}
          isError={categoriesQuery.isError}
          onSelect={(categoryId) => navigate(`/archive/${categoryId}?${searchParams.toString()}`)}
        />
      </section>
    );
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-8 py-12 text-white">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight">Archive</h1>
        <p className="text-white/50">?????? ??? ???? ?????.</p>
      </header>
      <CategoryGrid
        categories={categoriesQuery.data?.categories ?? []}
        isPending={categoriesQuery.isPending}
        isError={categoriesQuery.isError}
        onSelect={(categoryId) => navigate(`/archive/${categoryId}`)}
      />
    </section>
  );
}

function CategoryGrid({
  categories,
  isPending,
  isError,
  onSelect,
}: {
  categories: Array<{ categoryId: string; categoryName: string; cardCount: number }>;
  isPending: boolean;
  isError: boolean;
  onSelect: (categoryId: string) => void;
}) {
  if (isPending) {
    return <p className="py-16 text-center text-sm text-white/40">???? ??? ???? ????...</p>;
  }

  if (isError) {
    return <p className="py-16 text-center text-sm text-red-400">???? ??? ???? ?????.</p>;
  }

  if (categories.length === 0) {
    return (
      <ContentEmptyState
        title="?? ??? ??? ????"
        description="????? ??? ????? ??? ??? ????."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => (
        <button
          key={category.categoryId}
          type="button"
          onClick={() => onSelect(category.categoryId)}
          className="group flex min-h-40 flex-col justify-between rounded-[28px] border border-white/5 bg-[#131718] p-6 text-left transition hover:-translate-y-1 hover:border-action-accent/30 hover:bg-[#161a1b]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-action-accent/10 text-action-accent">
              <FolderOpen size={22} />
            </div>
            <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs font-bold text-white/45">
              {category.cardCount} cards
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white transition group-hover:text-action-accent">{category.categoryName}</h2>
            <p className="mt-2 text-sm text-white/40">?? ??</p>
          </div>
        </button>
      ))}
    </div>
  );
}
