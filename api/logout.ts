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

  const session = await getSession(req, res);
  session.destroy();

  return res.status(200).json({ ok: true });
}
