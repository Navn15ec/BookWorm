import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../AppContext';
import { errorMessage } from '../format';

const input = 'mt-1 w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white';

export default function Register() {
  const { notify } = useApp();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await api.register(username.trim(), email.trim(), password);
      setCreated(true);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirm('');
      notify('User created successfully.', { to: '/login', label: 'Go to sign in' });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-xl font-bold">Create account</h1>
      {created && (
        <p role="status" className="rounded border border-emerald-800 bg-emerald-950 p-3 text-sm text-emerald-300">
          User created successfully.{' '}
          <Link to="/login" className="font-medium underline">
            Go to sign in
          </Link>
        </p>
      )}
      <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm">
          Username
          <input
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_.\-]+"
            title="Letters, numbers, dot, dash or underscore"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={input}
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            type="email"
            required
            maxLength={254}
            autoComplete="email"
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
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
          <span className="text-xs text-neutral-400">8 to 72 characters</span>
        </label>
        <label className="block text-sm">
          Confirm password
          <input
            type="password"
            required
            maxLength={72}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p className="text-center text-sm text-neutral-400">
        Already have an account?{' '}
        <Link to="/login" className="text-sky-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
