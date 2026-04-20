import { useEffect, useState, useCallback } from 'react';
import type { Category } from '../content/image-slots';

export type SlotImage = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
};

type State =
  | { status: 'loading' }
  | { status: 'success'; images: SlotImage[] }
  | { status: 'error'; error: string };

export function useSlotImages(category: Category, slotId: string) {
  const [state, setState] = useState<State>({ status: 'loading' });

  const refresh = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const res = await fetch(
        `/api/images?category=${encodeURIComponent(category)}&slot=${encodeURIComponent(slotId)}`,
        { credentials: 'same-origin' }
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setState({ status: 'error', error: body.error ?? `HTTP ${res.status}` });
        return;
      }
      const data = (await res.json()) as { images: SlotImage[] };
      setState({ status: 'success', images: data.images });
    } catch (err) {
      setState({ status: 'error', error: (err as Error).message });
    }
  }, [category, slotId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, refresh };
}
