import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';
import { getSession } from '../src/lib/session';
import { normalizePhone } from '../src/lib/phone';

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Fail loud if env is misconfigured — do NOT silently accept empty creds.
  const adminPassword = process.env.ADMIN_PASSWORD ?? '';
  const adminPhonesRaw = process.env.ADMIN_PHONES ?? '';
  if (!adminPassword || !adminPhonesRaw) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const { phone, password } = (req.body ?? {}) as {
    phone?: unknown;
    password?: unknown;
  };

  if (typeof phone !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Missing phone or password' });
  }
  if (password.length === 0) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const normalized = normalizePhone(phone);
  if (normalized === null) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const allowed = adminPhonesRaw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const phoneOk = allowed.includes(normalized);
  const passwordOk = constantTimeEquals(password, adminPassword);

  if (!phoneOk || !passwordOk) {
    return res.status(401).json({ error: 'Invalid phone or password' });
  }

  const session = await getSession(req, res);
  session.phone = normalized;
  await session.save();

  return res.status(200).json({ phone: normalized });
}
