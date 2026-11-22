import { Link } from 'react-router-dom';
import BookCard from './BookCard';
import { dateTime, hoursLeft, money } from '../format';
import type { CartLine, Order } from '../types';

export default function PurchaseSuccess({ order, lines }: { order: Order; lines: CartLine[] }) {
  return (
    <div className="mx-auto max-w-3xl rounded-lg border border-neutral-800 bg-neutral-900 px-6 py-10 sm:px-10">
      <div className="mb-6 flex flex-col items-center gap-5 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 role="status" className="text-lg font-normal leading-snug">
          Your purchase of the
          <br />
          following reads is successful
        </h1>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {lines.map(({ book }) => (
          <BookCard key={book.id} book={book} readOnly />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-neutral-400">
        Order <strong className="text-neutral-200">{order.orderNumber}</strong> · {money(order.totalAmount)} · Tracking{' '}
        {order.trackingNumber}
        <br />
        You can cancel until {dateTime(order.cancellationDeadline)} ({hoursLeft(order.cancellationDeadline)}h left) from{' '}
        <Link to="/orders" className="text-sky-400 hover:underline">
          My Orders
        </Link>
        .
      </p>

      <div className="mt-6 flex justify-center">
        <Link
          to="/books"
          className="rounded bg-blue-600 px-10 py-3 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Continue your Shopping
        </Link>
      </div>
    </div>
  );
}
