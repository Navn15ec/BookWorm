import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { api } from './api';
import type { Cart, User } from './types';

export interface Toast {
  message: string;
  link?: { to: string; label: string };
}

interface AppState {
  user: User | null;
  cart: Cart;
  toast: Toast | null;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  addToCart: (bookId: number, quantity?: number) => Promise<void>;
  setQuantity: (bookId: number, quantity: number) => Promise<void>;
  removeItem: (bookId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  notify: (message: string, link?: Toast['link']) => void;
}

const emptyCart: Cart = { items: [], subtotal: 0, itemCount: 0 };
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const notify = useCallback((message: string, link?: Toast['link']) => {
    window.clearTimeout(timer.current);
    setToast({ message, link });
    // Toasts with a link stay longer so there is time to click it.
    timer.current = window.setTimeout(() => setToast(null), link ? 10000 : 3000);
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await api.me());
  }, []);
  const refreshCart = useCallback(async () => {
    setCart(await api.cart());
  }, []);

  useEffect(() => {
    Promise.all([api.me(), api.cart()])
      .then(([u, c]) => {
        setUser(u);
        setCart(c);
      })
      .catch(() => notify('Unable to reach the server. Is the backend running?'));
  }, [notify]);

  const value = useMemo<AppState>(
    () => ({
      user,
      cart,
      toast,
      refreshUser,
      refreshCart,
      notify,
      login: async (email, password) => {
        const res = await api.login(email, password);
        setUser(await api.me().catch(() => res.user));
        setCart(await api.cart().catch(() => emptyCart));
      },
      logout: async () => {
        const res = await api.logout();
        setUser(res.user);
        setCart(emptyCart);
      },
      continueAsGuest: async () => {
        const res = await api.guestSession();
        setUser(res.user);
        setCart(emptyCart);
      },
      addToCart: async (bookId, quantity = 1) => {
        setCart(await api.addToCart(bookId, quantity));
      },
      setQuantity: async (bookId, quantity) => {
        setCart(await api.setCartQuantity(bookId, quantity));
      },
      removeItem: async (bookId) => {
        setCart(await api.removeFromCart(bookId));
      },
    }),
    [user, cart, toast, refreshUser, refreshCart, notify],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
