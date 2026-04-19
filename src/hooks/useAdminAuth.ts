import { useEffect, useState, useCallback } from 'react';

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; phone: string }
  | { status: 'unauthenticated' };

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = (await res.json()) as { phone: string };
        setState({ status: 'authenticated', phone: data.phone });
      } else {
        setState({ status: 'unauthenticated' });
      }
    } catch {
      setState({ status: 'unauthenticated' });
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    setState({ status: 'unauthenticated' });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, refresh, logout };
}
