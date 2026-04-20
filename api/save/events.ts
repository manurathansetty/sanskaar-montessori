import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { getFile, putFile, GitHubAuthError } from '../../src/lib/github';

const SLUG_RE = /^[a-z0-9-]+$/;
const TYPES = ['featured', 'programme', 'admissions'];

function isNonEmpty(s: unknown): boolean {
  return typeof s === 'string' && s.trim().length > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session.phone) return res.status(401).json({ error: 'Unauthorized' });

  const events = req.body;
  if (!Array.isArray(events)) return res.status(400).json({ error: 'validation' });

  const ids = new Set<string>();
  for (const e of events) {
    if (!isNonEmpty(e?.id) || !SLUG_RE.test(e.id)) return res.status(400).json({ error: 'validation' });
    if (!TYPES.includes(e?.type)) return res.status(400).json({ error: 'validation' });
    if (!isNonEmpty(e?.title) || !isNonEmpty(e?.lede)) return res.status(400).json({ error: 'validation' });
    if (!isNonEmpty(e?.imageSlot) || !SLUG_RE.test(e.imageSlot)) return res.status(400).json({ error: 'validation' });
    if (!Number.isInteger(e?.order)) return res.status(400).json({ error: 'validation' });
    if (!Array.isArray(e?.pills)) return res.status(400).json({ error: 'validation' });
    for (const p of e.pills) {
      if (!isNonEmpty(p?.label) || !isNonEmpty(p?.value)) return res.status(400).json({ error: 'validation' });
    }
    if (!Array.isArray(e?.tags)) return res.status(400).json({ error: 'validation' });
    if (ids.has(e.id)) return res.status(400).json({ error: 'validation' });
    ids.add(e.id);
  }

  try {
    const { sha } = await getFile('src/content/events.json');
    await putFile(
      'src/content/events.json',
      JSON.stringify(events, null, 2) + '\n',
      sha,
      'chore: edit events (via admin)'
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof GitHubAuthError) return res.status(500).json({ error: 'github_auth' });
    return res.status(500).json({ error: 'github_other', message: (err as Error).message });
  }
}
