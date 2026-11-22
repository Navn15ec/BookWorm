import { Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { errorMessage, money } from '../format';

export default function CartPage() {
  const { cart, setQuantity, removeItem, notify } = useApp();

  const run = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-neutral-400">Your basket is empty.</p>
        <Link to="/books" className="rounded bg-white px-4 py-2 text-sm font-medium text-black">
          Browse books
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_20rem]">
      <section>
        <h1 className="mb-4 text-xl font-bold">Your basket ({cart.itemCount})</h1>
        <ul className="divide-y divide-neutral-800 rounded-lg border border-neutral-800 bg-neutral-900">
          {cart.items.map(({ book, quantity, itemTotal }) => (
            <li key={book.id} className="flex gap-4 p-4">
              <img src={book.coverImage} alt="" className="h-24 w-16 rounded object-cover" />
              <div className="flex-1">
                <Link to={`/books/${book.id}`} className="font-semibold hover:text-neutral-300">
                  {book.title}
                </Link>
                <p className="text-sm text-neutral-400">{book.author}</p>
                <p className="text-sm text-neutral-400">{money(book.price)} each</p>
                <div className="mt-2 flex items-center gap-3 text-sm">
                  <label>
                    Qty{' '}
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) => {
                        const q = Math.floor(Number(e.target.value));
                        if (q >= 1 && q <= 99) run(() => setQuantity(book.id, q));
                      }}
                      className="w-16 rounded border border-neutral-700 bg-neutral-900 text-white px-2 py-1"
                    />
                  </label>
                  <button onClick={() => run(() => removeItem(book.id))} className="text-red-400 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-semibold">{money(itemTotal)}</p>
            </li>
          ))}
        </ul>
      </section>
      <aside className="h-fit space-y-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{money(cart.subtotal)}</span>
        </div>
        <p className="text-xs text-neutral-400">Shipping, tax and discounts are calculated at checkout.</p>
        <Link
          to="/checkout"
          className="block rounded bg-white px-4 py-2 text-center text-sm font-medium text-black hover:bg-neutral-200"
        >
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
