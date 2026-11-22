import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../AppContext';
import { Status } from '../components/Status';
import { dateTime, errorMessage, hoursLeft, money } from '../format';
import type { Order, OrderItem } from '../types';
import { useAsync } from '../useAsync';

export default function Orders() {
  const orders = useAsync(() => api.orders(), []);
  const { addToCart, refreshUser, notify } = useApp();

  const buyAgain = async (item: OrderItem) => {
    try {
      await addToCart(item.bookId, 1);
      notify(`Added "${item.title}" to your basket`);
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  const cancel = async (o: Order) => {
    if (!window.confirm(`Cancel order ${o.orderNumber}?`)) return;
    try {
      const r = await api.cancelOrder(o.id, 'Customer requested cancellation');
      notify(r.message);
    } catch (e) {
      notify(errorMessage(e));
    }
    orders.reload();
    refreshUser().catch(() => undefined);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Order history</h1>
      <Status state={orders}>
        {(list) =>
          list.length === 0 ? (
            <p className="text-neutral-400">
              No orders yet. <Link to="/books" className="text-sky-400 underline">Start shopping</Link>
            </p>
          ) : (
            list.map((o) => (
              <article key={o.id} className="rounded-lg border border-neutral-800 bg-neutral-900">
                <header className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-neutral-800 bg-neutral-950 p-3 text-sm">
                  <span className="font-semibold">{o.orderNumber}</span>
                  <span>Placed {dateTime(o.createdAt)}</span>
                  <span>Total {money(o.totalAmount)}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      o.status === 'CANCELLED' ? 'bg-red-950 text-red-300' : 'bg-neutral-700 text-white'
                    }`}
                  >
                    {o.status}
                  </span>
                  {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                    <span className="text-neutral-400">Delivery: {o.tentativeDeliveryDate}</span>
                  )}
                </header>
                <ul className="divide-y divide-neutral-800">
                  {o.items.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 p-3">
                      <img src={i.coverImage} alt="" className="h-16 w-12 rounded object-cover" />
                      <div className="flex-1 text-sm">
                        <Link to={`/books/${i.bookId}`} className="font-medium hover:text-neutral-300">
                          {i.title}
                        </Link>
                        <p className="text-neutral-400">
                          {i.quantity} × {money(i.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => buyAgain(i)}
                        className="rounded border border-neutral-500 px-3 py-1 text-sm text-white hover:bg-neutral-800"
                      >
                        Buy it again
                      </button>
                    </li>
                  ))}
                </ul>
                {o.isEligibleForCancellation && (
                  <footer className="flex items-center justify-between border-t border-neutral-800 p-3 text-sm">
                    <span className="text-neutral-400">
                      Cancellable for {hoursLeft(o.cancellationDeadline)}h more
                    </span>
                    <button onClick={() => cancel(o)} className="text-red-400 hover:underline">
                      Cancel order
                    </button>
                  </footer>
                )}
              </article>
            ))
          )
        }
      </Status>
    </div>
  );
}
