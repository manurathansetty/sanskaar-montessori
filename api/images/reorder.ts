import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { setImageSort } from '../../src/lib/cloudinary';

type Ordering = { public_id: string; sort: number };

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session.phone) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { orderings } = (req.body ?? {}) as { orderings?: unknown };
  if (!Array.isArray(orderings)) {
    return res.status(400).json({ error: 'orderings must be an array' });
  }
  for (const o of orderings as Ordering[]) {
    if (
      typeof o?.public_id !== 'string' ||
      typeof o?.sort !== 'number' ||
      !Number.isFinite(o.sort)
    ) {
      return res
        .status(400)
        .json({ error: 'each ordering needs public_id (string) and sort (number)' });
    }
  }

  try {
    await Promise.all(
      (orderings as Ordering[]).map((o) => setImageSort(o.public_id, o.sort))
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
