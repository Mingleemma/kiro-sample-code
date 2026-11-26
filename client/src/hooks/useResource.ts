import { useCallback, useEffect, useState } from 'react';

export interface Resource<T> {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
  reload: () => void;
}

/**
 * Loads data when `deps` change and exposes loading/error state.
 * Keeps the previous data while reloading so the UI does not flicker.
 */
export function useResource<T>(load: () => Promise<T>, deps: unknown[]): Resource<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    load().then(
      (result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      },
      (err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
    // `load` is intentionally not a dependency: callers list what it depends on in `deps`.
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { data, error, loading, reload };
}
