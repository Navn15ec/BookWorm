import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { errorMessage } from '../format';

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.5 18c1.2-2.2 3.2-3.2 5.5-3.2s4.3 1 5.5 3.2" strokeLinecap="round" />
  </svg>
);

export default function Header() {
  const { user, cart, toast, logout, notify } = useApp();
  const navigate = useNavigate();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm ${isActive ? 'text-white' : 'text-neutral-400 hover:text-white'}`;

  const signOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      notify(errorMessage(e));
    }
  };

  const signedIn = user?.role === 'REGISTERED';

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link to="/" className="mr-2 text-sm font-semibold tracking-tight">
          Book Worm
        </Link>
        <nav className="flex flex-1 gap-6">
          <NavLink to="/books" className={linkCls}>
            Catalog
          </NavLink>
          <NavLink to="/orders" className={linkCls}>
            My Orders
          </NavLink>
        </nav>
        <Link to="/cart" aria-label={`Cart, ${cart.itemCount} items`} className="relative text-neutral-300 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 4h2l2.4 11h10.2L20 7H6.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="19" r="1.3" />
            <circle cx="17" cy="19" r="1.3" />
          </svg>
          {cart.itemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
              {cart.itemCount}
            </span>
          )}
        </Link>

        {signedIn && user ? (
          // The menu opens on hover and on keyboard focus (focus-within), so it works without a mouse.
          <div className="group relative">
            <button
              type="button"
              aria-haspopup="menu"
              className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white group-focus-within:text-white"
            >
              <ProfileIcon />
              <span className="max-w-32 truncate">{user.fullName}</span>
            </button>
            <div className="invisible absolute right-0 top-full z-20 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div role="menu" className="w-52 rounded border border-neutral-800 bg-neutral-900 py-1 shadow-lg">
                <div className="border-b border-neutral-800 px-3 py-2">
                  <p className="truncate text-sm font-medium">{user.fullName}</p>
                  <p className="truncate text-xs text-neutral-400">{user.email}</p>
                  <p className="mt-1 text-xs text-neutral-400">{user.giftPointsBalance} gift points</p>
                </div>
                <Link role="menuitem" to="/orders" className="block px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white">
                  My Orders
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="block w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white">
            <ProfileIcon />
            Sign in
          </Link>
        )}
      </div>
      {toast && (
        <div role="status" className="bg-white px-4 py-2 text-center text-sm font-medium text-black">
          {toast.message}
          {toast.link && (
            <>
              {' '}
              <Link to={toast.link.to} className="underline">
                {toast.link.label}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
