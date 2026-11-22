import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import BookCard from '../components/BookCard';
import CategorySidebar from '../components/CategorySidebar';
import FilterBar, { PRICE_RANGES } from '../components/FilterBar';
import { BookGrid, Shell, Status } from '../components/Status';
import { useAsync } from '../useAsync';

const toId = (v: string | null): number | undefined => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : undefined;
};

export default function Catalog() {
  const [params] = useSearchParams();
  const categoryId = toId(params.get('categoryId'));
  const publisherId = toId(params.get('publisherId'));
  const search = params.get('search')?.slice(0, 100) || undefined;
  const language = params.get('language') ?? '';
  const price = PRICE_RANGES[params.get('price') ?? ''] ?? PRICE_RANGES[''];
  const sort = params.get('sort') ?? '';

  const everything = useAsync(() => api.books(), []);
  const books = useAsync(
    () => api.books({ categoryId, publisherId, search }),
    [categoryId, publisherId, search],
  );

  const languages = [...new Set(everything.data?.map((b) => b.language) ?? [])].sort();

  const visible = (books.data ?? [])
    .filter((b) => (!language || b.language === language) && price.test(b.price))
    .sort((a, b) =>
      sort === 'priceAsc' ? a.price - b.price : sort === 'priceDesc' ? b.price - a.price : sort === 'rating' ? b.rating - a.rating : 0,
    );

  return (
    <Shell sidebar={<CategorySidebar activeId={categoryId} />}>
      <div className="space-y-6">
        <FilterBar languages={languages} />
        <h1 className="text-lg font-medium">{search ? `Results for "${search}"` : 'All books'}</h1>
        <Status state={books}>
          {() =>
            visible.length === 0 ? (
              <p className="py-8 text-center text-neutral-400">No books match your filters.</p>
            ) : (
              <BookGrid>
                {visible.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </BookGrid>
            )
          }
        </Status>
      </div>
    </Shell>
  );
}
