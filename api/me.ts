import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../src/lib/session';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session.phone) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.status(200).json({ phone: session.phone });
  } catch (err) {
    console.error('[me] session error:', (err as Error).message);
    return res.status(500).json({ error: 'session_error', message: (err as Error).message });
  }
}
