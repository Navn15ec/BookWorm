import { useNavigate, useSearchParams } from 'react-router-dom';

export const PRICE_RANGES: Record<string, { label: string; test: (p: number) => boolean }> = {
  '': { label: 'All', test: () => true },
  under250: { label: 'Under ₹250', test: (p) => p < 250 },
  '250to500': { label: '₹250 – ₹500', test: (p) => p >= 250 && p <= 500 },
  over500: { label: 'Over ₹500', test: (p) => p > 500 },
};

export const SORTS: Record<string, string> = {
  '': 'Relevance',
  priceAsc: 'Price: low to high',
  priceDesc: 'Price: high to low',
  rating: 'Rating',
};

const box =
  'rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none';

/** URL-driven filters. Changing any control navigates to the catalogue with the new query. */
export default function FilterBar({ languages }: { languages: string[] }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    navigate(`/books?${next.toString()}`);
  };

  const field = (label: string, control: React.ReactNode) => (
    <label className="block text-xs text-neutral-400">
      <span className="mb-1 block">{label}</span>
      {control}
    </label>
  );

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]"
    >
      <div className="col-span-2 md:col-span-1">
        {field(
          'Search you want to read here',
          <input
            key={params.get('search') ?? ''}
            defaultValue={params.get('search') ?? ''}
            maxLength={100}
            placeholder="Search"
            onKeyDown={(e) => {
              if (e.key === 'Enter') set('search', e.currentTarget.value.trim());
            }}
            onBlur={(e) => {
              if (e.currentTarget.value.trim() !== (params.get('search') ?? '')) set('search', e.currentTarget.value.trim());
            }}
            className={`${box} w-full placeholder:text-neutral-600`}
          />,
        )}
      </div>
      {field(
        'Language',
        <select className={`${box} w-full`} value={params.get('language') ?? ''} onChange={(e) => set('language', e.target.value)}>
          <option value="">All</option>
          {languages.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>,
      )}
      {field(
        'Price Range',
        <select className={`${box} w-full`} value={params.get('price') ?? ''} onChange={(e) => set('price', e.target.value)}>
          {Object.entries(PRICE_RANGES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>,
      )}
      {field(
        'Sort by',
        <select className={`${box} w-full`} value={params.get('sort') ?? ''} onChange={(e) => set('sort', e.target.value)}>
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>,
      )}
    </form>
  );
}
