import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { errorMessage, money } from '../format';
import type { Book } from '../types';

export default function BookCard({ book, readOnly = false }: { book: Book; readOnly?: boolean }) {
  const { addToCart, notify } = useApp();

  const add = async () => {
    try {
      await addToCart(book.id, 1);
      notify(`Added "${book.title}" to your basket`);
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  const discounted = book.originalPrice > book.price;
  const linkCls = 'text-sky-400 underline-offset-2 hover:underline';

  return (
    <article className="flex gap-4">
      <Link to={`/books/${book.id}`} className="shrink-0">
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          className="h-56 w-36 rounded-sm bg-neutral-800 object-cover"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link to={`/books/${book.id}`} className="font-medium leading-snug hover:underline">
          {book.title}
        </Link>
        <p className="text-xs text-neutral-400">
          by{' '}
          <Link to={`/books?search=${encodeURIComponent(book.author)}`} className={linkCls}>
            {book.author}
          </Link>
        </p>
        <p className="line-clamp-3 text-xs text-neutral-400">{book.description}</p>
        <p className="text-xs">
          <Link to={`/books?categoryId=${book.categoryId}`} className={linkCls}>
            {book.categoryName}
          </Link>
          <span className="text-neutral-600">, </span>
          <Link to={`/books?publisherId=${book.publisherId}`} className={linkCls}>
            {book.publisherName}
          </Link>
        </p>
        <p className="text-xs text-neutral-500">
          Rating {book.rating.toFixed(1)} ({book.ratingCount})
        </p>
        <div className="mt-auto space-y-1 pt-2">
          <p className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">{money(book.price)}</span>
            {discounted && <span className="text-xs text-neutral-500 line-through">{money(book.originalPrice)}</span>}
          </p>
          <p className="text-xs text-neutral-400">
            Delivery by <strong className="text-neutral-200">{book.tentativeDeliveryDate}</strong>
          </p>
          {!readOnly && (
            <button
              onClick={add}
              disabled={book.stockQuantity < 1}
              className="rounded bg-white px-3 py-1 text-xs font-medium text-black hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              {book.stockQuantity < 1 ? 'Out of stock' : 'Add to basket'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
