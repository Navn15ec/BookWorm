import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../useAsync';

export default function CategorySidebar({ activeId }: { activeId?: number }) {
  const categories = useAsync(() => api.categories(), []);

  const item = (active: boolean) =>
    `block border-l-2 px-3 py-1.5 text-sm ${
      active
        ? 'border-sky-400 bg-neutral-800 font-medium text-white'
        : 'border-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white'
    }`;

  return (
    <nav aria-label="Categories" className="hidden w-52 shrink-0 md:block">
      <ul className="sticky top-16 space-y-0.5">
        <li>
          <Link to="/books" className={item(activeId === undefined)}>
            All
          </Link>
        </li>
        {categories.data?.map((c) => (
          <li key={c.id}>
            <Link to={`/books?categoryId=${c.id}`} className={item(activeId === c.id)}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
