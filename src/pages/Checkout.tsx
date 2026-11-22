import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../AppContext';
import PurchaseSuccess from '../components/PurchaseSuccess';
import { Status } from '../components/Status';
import { errorMessage, money } from '../format';
import type { AddressInput, CartLine, Order, PaymentMethod } from '../types';
import { useAsync } from '../useAsync';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CREDIT_CARD', label: 'Credit card' },
  { value: 'DEBIT_CARD', label: 'Debit card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'NET_BANKING', label: 'Net banking' },
  { value: 'GIFT_WALLET', label: 'Gift wallet' },
];

// Mirrors the backend's pricing rules (INR); the server remains the source of truth.
const POINT_VALUE = 0.5;
const SHIPPING_FEE = 49;
const FREE_SHIPPING_THRESHOLD = 350;
const EMPTY_ADDRESS: AddressInput = {
  recipientName: '',
  phoneNumber: '',
  streetAddress1: '',
  city: '',
  stateProvince: '',
  postalCode: '',
  country: 'United States',
};

export default function Checkout() {
  const { cart, user, refreshCart, refreshUser, notify } = useApp();
  const addresses = useAsync(() => api.addresses(), []);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>('CREDIT_CARD');
  const [points, setPoints] = useState(0);
  const [code, setCode] = useState('');
  const [coupon, setCoupon] = useState<{ amount: number; message: string; code: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressInput>(EMPTY_ADDRESS);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ order: Order; lines: CartLine[] } | null>(null);

  if (placed) return <PurchaseSuccess order={placed.order} lines={placed.lines} />;

  if (cart.items.length === 0) {
    return (
      <p className="py-12 text-center text-neutral-400">
        Your basket is empty. <Link to="/books" className="text-sky-400 underline">Browse books</Link>
      </p>
    );
  }

  const maxPoints = user?.giftPointsBalance ?? 0;
  const pointsApplied = Math.min(points, maxPoints);
  // Mirrors the backend's pricing rules; the server remains the source of truth.
  const shipping = cart.subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(cart.subtotal * 0.08 * 100) / 100;
  const couponDiscount = coupon?.amount ?? 0;
  const pointsDiscount = Math.round(pointsApplied * POINT_VALUE * 100) / 100;
  const total = Math.max(0, cart.subtotal + shipping + tax - couponDiscount - pointsDiscount);

  const applyCoupon = async () => {
    setCouponError(null);
    try {
      const r = await api.validateCoupon(code.trim(), cart.subtotal);
      setCoupon({ amount: r.discountAmount, message: r.message, code: code.trim() });
    } catch (e) {
      setCoupon(null);
      setCouponError(errorMessage(e));
    }
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const a = await api.addAddress(form);
      addresses.reload();
      setAddressId(a.id);
      setShowForm(false);
      setForm(EMPTY_ADDRESS);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const place = async (list: { id: number; isDefault: boolean }[]) => {
    const chosen = addressId ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id;
    if (!chosen) {
      setError('Please add a delivery address.');
      return;
    }
    setPlacing(true);
    setError(null);
    const lines = cart.items; // snapshot: the cart is emptied once the order is placed
    try {
      const res = await api.placeOrder({
        addressId: chosen,
        paymentMethod: payment,
        redeemGiftPoints: pointsApplied,
        couponCode: coupon?.code,
      });
      setPlaced({ order: res.order, lines });
      await Promise.all([refreshCart(), refreshUser()]);
    } catch (e) {
      setError(errorMessage(e));
      notify(errorMessage(e));
    } finally {
      setPlacing(false);
    }
  };

  const field = (key: keyof AddressInput, label: string) => (
    <label className="text-sm">
      {label}
      <input
        required={key !== 'country'}
        maxLength={120}
        value={form[key] ?? ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full rounded border border-neutral-700 bg-neutral-900 text-white px-2 py-1.5"
      />
    </label>
  );

  return (
    <Status state={addresses}>
      {(list) => {
        const selected = addressId ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id ?? null;
        return (
          <div className="grid gap-8 md:grid-cols-[1fr_22rem]">
            <div className="space-y-6">
              <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="font-bold">1. Delivery address</h2>
                {list.map((a) => (
                  <label key={a.id} className="flex cursor-pointer gap-2 text-sm">
                    <input
                      type="radio"
                      name="address"
                      checked={selected === a.id}
                      onChange={() => setAddressId(a.id)}
                    />
                    <span>
                      <strong>{a.recipientName}</strong>
                      <br />
                      {a.streetAddress1}, {a.city}, {a.stateProvince} {a.postalCode}, {a.country}
                    </span>
                  </label>
                ))}
                <button onClick={() => setShowForm(!showForm)} className="text-sm text-sky-400 hover:underline">
                  {showForm ? 'Cancel' : '+ Add new address'}
                </button>
                {showForm && (
                  <form onSubmit={saveAddress} className="grid gap-3 sm:grid-cols-2">
                    {field('recipientName', 'Recipient name')}
                    {field('phoneNumber', 'Phone')}
                    {field('streetAddress1', 'Street address')}
                    {field('city', 'City')}
                    {field('stateProvince', 'State / Province')}
                    {field('postalCode', 'Postal code')}
                    <button className="rounded bg-neutral-800 px-3 py-2 text-sm text-white sm:col-span-2">
                      Save address
                    </button>
                  </form>
                )}
              </section>

              <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="font-bold">2. Payment</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  {PAYMENT_METHODS.map((m) => (
                    <label key={m.value} className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="payment"
                        checked={payment === m.value}
                        onChange={() => setPayment(m.value)}
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="font-bold">3. Gift points &amp; coupon</h2>
                <label className="block text-sm">
                  Redeem gift points (balance {maxPoints} · 1 pt = {money(POINT_VALUE)})
                  <input
                    type="number"
                    min={0}
                    max={maxPoints}
                    value={points}
                    onChange={(e) => setPoints(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                    className="ml-2 w-24 rounded border border-neutral-700 bg-neutral-900 text-white px-2 py-1"
                  />
                </label>
                <div className="flex gap-2 text-sm">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={30}
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                    className="rounded border border-neutral-700 bg-neutral-900 text-white px-2 py-1"
                  />
                  <button onClick={applyCoupon} className="rounded border border-neutral-400 px-3 py-1">
                    Apply
                  </button>
                </div>
                {coupon && <p className="text-sm text-emerald-400">{coupon.message}</p>}
                {couponError && <p className="text-sm text-red-400">{couponError}</p>}
              </section>
            </div>

            <aside className="h-fit space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm">
              <h2 className="font-bold">Order summary</h2>
              <Row label="Subtotal" value={money(cart.subtotal)} />
              <Row label="Shipping" value={shipping === 0 ? 'Free' : money(shipping)} />
              <Row label="Tax (est.)" value={money(tax)} />
              {couponDiscount > 0 && <Row label="Coupon" value={`-${money(couponDiscount)}`} />}
              {pointsDiscount > 0 && <Row label="Gift points" value={`-${money(pointsDiscount)}`} />}
              <div className="flex justify-between border-t border-neutral-800 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
              {error && (
                <p role="alert" className="text-red-400">
                  {error}
                </p>
              )}
              <button
                onClick={() => place(list)}
                disabled={placing}
                className="w-full rounded bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200 disabled:bg-neutral-700"
              >
                {placing ? 'Placing order…' : 'Place order'}
              </button>
              <p className="text-xs text-neutral-400">Orders can be cancelled within 48 hours.</p>
            </aside>
          </div>
        );
      }}
    </Status>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
