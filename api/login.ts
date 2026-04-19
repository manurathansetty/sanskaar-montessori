import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../src/lib/session';
import { normalizePhone } from '../src/lib/phone';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, password } = (req.body ?? {}) as {
    phone?: unknown;
    password?: unknown;
  };

  if (typeof phone !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing phone or password' });
  }

  const normalized = normalizePhone(phone);
  const allowed = (process.env.ADMIN_PHONES ?? '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const phoneOk = normalized !== null && allowed.includes(normalized);
  const passwordOk = password === (process.env.ADMIN_PASSWORD ?? '');

  if (!phoneOk || !passwordOk) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const session = await getSession(req, res);
  session.phone = normalized!;
  await session.save();

  return res.status(200).json({ phone: normalized });
}
