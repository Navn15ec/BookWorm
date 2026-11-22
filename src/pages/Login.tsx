import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { errorMessage, money } from '../format';

const input = 'mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white';

export default function Login() {
  const { user, login, logout, continueAsGuest } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      navigate('/');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Sign in</h1>
      {user?.role === 'REGISTERED' && (
        <div className="space-y-2 rounded bg-neutral-900 p-3 text-sm">
          <p>
            Signed in as <strong>{user.fullName}</strong> · {user.giftPointsBalance} gift points (
            {money(user.giftPointsValue ?? user.giftPointsBalance * 0.5)})
          </p>
          <button onClick={() => run(logout)} className="text-sky-400 hover:underline">
            Sign out
          </button>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(() => login(email.trim(), password));
        }}
        className="space-y-3"
      >
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}
        <button
          disabled={busy}
          className="w-full rounded bg-white px-4 py-2 font-medium text-black hover:bg-neutral-200 disabled:bg-neutral-700"
        >
          Sign in
        </button>
      </form>
      <p className="text-center text-sm text-neutral-400">
        New here?{' '}
        <Link to="/register" className="text-sky-400 hover:underline">
          Create an account
        </Link>
      </p>
      <button
        onClick={() => run(continueAsGuest)}
        disabled={busy}
        className="w-full rounded border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800"
      >
        Continue as guest
      </button>
    </div>
  );
}
