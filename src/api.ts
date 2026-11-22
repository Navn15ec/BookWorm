import type {
  Address,
  AddressInput,
  Book,
  BookDetail,
  Cart,
  Category,
  CouponResult,
  Order,
  PaymentMethod,
  Publisher,
  User,
} from './types';

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4000/api/v1';
const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
      signal: controller.signal,
    });
    const text = await res.text();
    const body: unknown = text ? JSON.parse(text) : undefined;
    if (!res.ok) {
      const b = body as { error?: string; message?: string } | undefined;
      throw new ApiError(b?.error ?? b?.message ?? 'Request failed', res.status, body);
    }
    return body as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError('Unable to reach the server. Please try again.', 0);
  } finally {
    clearTimeout(timer);
  }
}

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

export interface BookFilters {
  categoryId?: number;
  publisherId?: number;
  search?: string;
  featured?: boolean;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', json('POST', { email, password })),
  register: (username: string, email: string, password: string) =>
    request<{ message: string }>('/auth/register', json('POST', { username, email, password })),
  logout: () => request<{ user: User }>('/auth/logout', json('POST')),

  guestSession: () => request<{ token: string; user: User }>('/auth/guest-session', json('POST')),
  me: () => request<User>('/users/me'),
  addresses: () => request<Address[]>('/users/me/addresses'),
  addAddress: (a: AddressInput) => request<Address>('/users/me/addresses', json('POST', a)),

  categories: () => request<Category[]>('/categories'),
  publishers: () => request<Publisher[]>('/publishers'),
  books: (f: BookFilters = {}) => {
    const q = new URLSearchParams();
    if (f.categoryId) q.set('categoryId', String(f.categoryId));
    if (f.publisherId) q.set('publisherId', String(f.publisherId));
    if (f.search) q.set('search', f.search);
    if (f.featured !== undefined) q.set('featured', String(f.featured));
    const qs = q.toString();
    return request<Book[]>(`/books${qs ? `?${qs}` : ''}`);
  },
  book: (id: number) => request<BookDetail>(`/books/${id}`),

  cart: () => request<Cart>('/cart'),
  addToCart: (bookId: number, quantity = 1) => request<Cart>('/cart', json('POST', { bookId, quantity })),
  setCartQuantity: (bookId: number, quantity: number) =>
    request<Cart>(`/cart/items/${bookId}`, json('PUT', { quantity })),
  removeFromCart: (bookId: number) => request<Cart>(`/cart/items/${bookId}`, json('DELETE')),

  orders: () => request<Order[]>('/orders'),
  recommendations: () => request<Book[]>('/orders/recommendations'),
  placeOrder: (p: {
    addressId: number;
    paymentMethod: PaymentMethod;
    redeemGiftPoints: number;
    couponCode?: string;
  }) => request<{ success: boolean; order: Order; message: string }>('/orders', json('POST', p)),
  cancelOrder: (orderId: number, reason: string) =>
    request<{ success: boolean; message: string; order?: Order }>(
      `/orders/${orderId}/cancel`,
      json('POST', { reason }),
    ),
  validateCoupon: (code: string, orderAmount: number) =>
    request<CouponResult>('/coupons/validate', json('POST', { code, orderAmount })),
};
