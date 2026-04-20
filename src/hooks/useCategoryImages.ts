import { useEffect, useState, useCallback } from 'react';
import type { Category } from '../content/image-slots';
import type { SlotImage } from './useSlotImages';

type State =
  | { status: 'loading' }
  | { status: 'success'; slots: Record<string, SlotImage[]> }
  | { status: 'error'; error: string };

export function useCategoryImages(category: Category) {
  const [state, setState] = useState<State>({ status: 'loading' });

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(
        `/api/images/category?category=${encodeURIComponent(category)}`,
        { credentials: 'same-origin' }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setState({ status: 'error', error: body.error ?? `HTTP ${res.status}` });
        return;
      }
      const data = (await res.json()) as { slots: Record<string, SlotImage[]> };
      setState({ status: 'success', slots: data.slots });
    } catch (err) {
      setState({ status: 'error', error: (err as Error).message });
    }
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, refresh };
}
