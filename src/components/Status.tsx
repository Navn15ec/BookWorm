import type { ReactNode } from 'react';
import type { AsyncState } from '../useAsync';

export function Status<T>({
  state,
  children,
}: {
  state: AsyncState<T>;
  children: (data: T) => ReactNode;
}) {
  if (state.loading && !state.data) return <p className="py-8 text-center text-neutral-400">Loading…</p>;
  if (state.error) {
    return (
      <p role="alert" className="rounded border border-red-900 bg-red-950 p-3 text-sm text-red-300">
        {state.error}
      </p>
    );
  }
  if (!state.data) return null;
  return <>{children(state.data)}</>;
}

export function BookGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

export function Shell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-8">
      {sidebar}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
