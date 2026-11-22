import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../AppContext';
import BookCard from '../components/BookCard';
import { BookGrid, Status } from '../components/Status';
import { errorMessage, money } from '../format';
import { useAsync } from '../useAsync';

export default function BookDetailPage() {
  const id = Number(useParams().id);
  const state = useAsync(() => api.book(id), [id]);
  const { addToCart, notify } = useApp();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);

  const add = async (buyNow: boolean) => {
    try {
      await addToCart(id, qty);
      if (buyNow) navigate('/cart');
      else notify('Added to your basket');
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  if (!Number.isInteger(id)) return <p role="alert">Invalid book.</p>;

  return (
    <Status state={state}>
      {(b) => (
        <div className="space-y-10">
          <div className="grid gap-8 md:grid-cols-[18rem_1fr]">
            <img src={b.coverImage} alt={`Cover of ${b.title}`} className="w-full rounded-lg object-cover" />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold">{b.title}</h1>
              <p className="text-neutral-400">
                by {b.author} · {b.publisherName} · {b.categoryName}
              </p>
              <p className="text-sm text-neutral-400">
                Rating {b.rating.toFixed(1)} ({b.ratingCount}) · {b.pageCount} pages · {b.language} ·{' '}
                {b.publicationYear} · ISBN {b.isbn}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">{money(b.price)}</span>
                {b.originalPrice > b.price && (
                  <span className="text-neutral-400 line-through">{money(b.originalPrice)}</span>
                )}
              </div>
              <p className="text-sm font-medium text-emerald-400">
                Tentative delivery: {b.tentativeDeliveryDate}
              </p>
              <p className="text-neutral-300">{b.description}</p>
              {b.stockQuantity > 0 ? (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="text-sm">
                    Qty{' '}
                    <input
                      type="number"
                      min={1}
                      max={Math.min(99, b.stockQuantity)}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                      className="w-16 rounded border border-neutral-700 bg-neutral-900 text-white px-2 py-1"
                    />
                  </label>
                  <button
                    onClick={() => add(false)}
                    className="rounded bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
                  >
                    Add to basket
                  </button>
                  <button
                    onClick={() => add(true)}
                    className="rounded border border-neutral-500 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                  >
                    Buy now
                  </button>
                </div>
              ) : (
                <p className="font-medium text-red-400">Out of stock</p>
              )}
            </div>
          </div>
          {b.relatedProducts.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Customers also bought</h2>
              <BookGrid>
                {b.relatedProducts.map((r) => (
                  <BookCard key={r.id} book={r} />
                ))}
              </BookGrid>
            </section>
          )}
        </div>
      )}
    </Status>
  );
}
