import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { getFile, putFile, GitHubAuthError } from '../../src/lib/github';

function isUrl(s: unknown): boolean {
  return typeof s === 'string' && (s.startsWith('http://') || s.startsWith('https://'));
}

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

  const body = req.body as Record<string, unknown>;

  // Basic shape validation
  const school = body?.school as Record<string, unknown>;
  const contact = body?.contact as Record<string, unknown>;
  const pages = body?.pages as Record<string, unknown>;

  if (!school || !contact || !pages) {
    return res.status(400).json({ error: 'validation' });
  }
  if (!isNonEmpty(school.name) || !isNonEmpty(school.tagline)) {
    return res.status(400).json({ error: 'validation' });
  }

  const phones = contact.phones as Array<Record<string, unknown>>;
  if (!Array.isArray(phones) || phones.length === 0) {
    return res.status(400).json({ error: 'validation' });
  }
  for (const p of phones) {
    if (!isNonEmpty(p.tel) || !isNonEmpty(p.display)) {
      return res.status(400).json({ error: 'validation' });
    }
    if (!/^\+?\d{6,15}$/.test(String(p.tel).trim())) {
      return res.status(400).json({ error: 'validation' });
    }
  }
  const allTels = phones.map((p) => String(p.tel));
  if (!allTels.includes(String(contact.primaryPhone))) {
    return res.status(400).json({ error: 'validation' });
  }
  if (!isUrl(contact.registrationFormUrl)) return res.status(400).json({ error: 'validation' });
  const maps = contact.maps as Record<string, unknown>;
  if (!isUrl(maps?.shareUrl) || !isUrl(maps?.embedSrc)) {
    return res.status(400).json({ error: 'validation' });
  }

  const pageKeys = ['gallery', 'events', 'founders'] as const;
  for (const key of pageKeys) {
    const pg = (pages as Record<string, unknown>)[key] as Record<string, unknown>;
    const h = pg?.header as Record<string, unknown>;
    const c = pg?.ctaBanner as Record<string, unknown>;
    if (!isNonEmpty(h?.title) || !isNonEmpty(h?.subtitle)) return res.status(400).json({ error: 'validation' });
    if (!isNonEmpty(c?.title) || !isNonEmpty(c?.subtitle)) return res.status(400).json({ error: 'validation' });
  }
  const home = (pages as Record<string, unknown>).home as Record<string, unknown>;
  if (!isNonEmpty(home?.heroBadge) || !isNonEmpty(home?.heroDescription)) {
    return res.status(400).json({ error: 'validation' });
  }

  try {
    const { sha } = await getFile('src/content/site.json');
    await putFile(
      'src/content/site.json',
      JSON.stringify(body, null, 2) + '\n',
      sha,
      'chore: edit site config (via admin)'
    );
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof GitHubAuthError) return res.status(500).json({ error: 'github_auth' });
    return res.status(500).json({ error: 'github_other', message: (err as Error).message });
  }
}
