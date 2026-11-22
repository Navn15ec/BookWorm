import { api } from '../api';
import BookCard from '../components/BookCard';
import CategorySidebar from '../components/CategorySidebar';
import FilterBar from '../components/FilterBar';
import { BookGrid, Shell, Status } from '../components/Status';
import type { Book } from '../types';
import { useAsync } from '../useAsync';

function Section({ title, books }: { title: string; books: Book[] }) {
  if (books.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <BookGrid>
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </BookGrid>
    </section>
  );
}

export default function Home() {
  const all = useAsync(() => api.books(), []);
  const recs = useAsync(() => api.recommendations(), []);

  const languages = [...new Set(all.data?.map((b) => b.language) ?? [])].sort();

  return (
    <Shell sidebar={<CategorySidebar />}>
      <div className="space-y-8">
        <FilterBar languages={languages} />
        <Status state={recs}>{(books) => <Section title="Recommended for You" books={books.slice(0, 3)} />}</Status>
        <Status state={all}>
          {(books) => (
            <>
              <Section title="Bestsellers this Month" books={books.filter((b) => b.isBestSeller).slice(0, 3)} />
              <Section
                title="New Launches"
                books={[...books].sort((a, b) => b.publicationYear - a.publicationYear || b.id - a.id).slice(0, 3)}
              />
            </>
          )}
        </Status>
      </div>
    </Shell>
  );
}
