import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { deleteImage } from '../../src/lib/cloudinary';

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

  const { public_id } = (req.body ?? {}) as { public_id?: unknown };
  if (typeof public_id !== 'string' || public_id.length === 0) {
    return res.status(400).json({ error: 'public_id is required' });
  }
  if (!public_id.startsWith('sanskaar/')) {
    return res.status(400).json({ error: 'public_id must be in sanskaar/' });
  }

  try {
    await deleteImage(public_id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
