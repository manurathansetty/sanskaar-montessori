import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../src/lib/session';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    session.destroy();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[logout] session error:', (err as Error).message);
    return res.status(500).json({ error: 'session_error', message: (err as Error).message });
  }
}
