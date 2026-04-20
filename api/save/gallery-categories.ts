import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { getFile, putFile, GitHubAuthError } from '../../src/lib/github';

const SLUG_RE = /^[a-z0-9-]+$/;

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

  const cats = req.body;
  if (!Array.isArray(cats) || cats.length === 0) {
    return res.status(400).json({ error: 'validation' });
  }

  const ids = new Set<string>();
  for (const c of cats) {
    if (!isNonEmpty(c?.id) || !SLUG_RE.test(c.id)) return res.status(400).json({ error: 'validation' });
    if (c.id === 'uncategorized') return res.status(400).json({ error: 'validation' });
    if (!isNonEmpty(c?.label)) return res.status(400).json({ error: 'validation' });
    if (!Number.isInteger(c?.order)) return res.status(400).json({ error: 'validation' });
    if (ids.has(c.id)) return res.status(400).json({ error: 'validation' });
    ids.add(c.id);
  }

  try {
    const { sha } = await getFile('src/content/gallery-categories.json');
    await putFile(
      'src/content/gallery-categories.json',
      JSON.stringify(cats, null, 2) + '\n',
      sha,
      'chore: edit gallery categories (via admin)'
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof GitHubAuthError) return res.status(500).json({ error: 'github_auth' });
    return res.status(500).json({ error: 'github_other', message: (err as Error).message });
  }
}
