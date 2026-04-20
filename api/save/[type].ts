import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { getFile, putFile, GitHubAuthError } from '../../src/lib/github';

const SLUG_RE = /^[a-z0-9-]+$/;
const EVENT_TYPES = ['featured', 'programme', 'admissions'];

function isNonEmpty(s: unknown): boolean {
  return typeof s === 'string' && s.trim().length > 0;
}

function isUrl(s: unknown): boolean {
  return typeof s === 'string' && (s.startsWith('http://') || s.startsWith('https://'));
}

function validateSite(body: Record<string, unknown>): boolean {
  const school = body?.school as Record<string, unknown>;
  const contact = body?.contact as Record<string, unknown>;
  const pages = body?.pages as Record<string, unknown>;
  if (!school || !contact || !pages) return false;
  if (!isNonEmpty(school.name) || !isNonEmpty(school.tagline)) return false;
  const phones = contact.phones as Array<Record<string, unknown>>;
  if (!Array.isArray(phones) || phones.length === 0) return false;
  for (const p of phones) {
    if (!isNonEmpty(p.tel) || !isNonEmpty(p.display)) return false;
    if (!/^\+?\d{6,15}$/.test(String(p.tel).trim())) return false;
  }
  if (!phones.map((p) => String(p.tel)).includes(String(contact.primaryPhone))) return false;
  if (!isUrl(contact.registrationFormUrl)) return false;
  const maps = contact.maps as Record<string, unknown>;
  if (!isUrl(maps?.shareUrl) || !isUrl(maps?.embedSrc)) return false;
  for (const key of ['gallery', 'events', 'founders'] as const) {
    const pg = (pages as Record<string, unknown>)[key] as Record<string, unknown>;
    const h = pg?.header as Record<string, unknown>;
    const c = pg?.ctaBanner as Record<string, unknown>;
    if (!isNonEmpty(h?.title) || !isNonEmpty(h?.subtitle)) return false;
    if (!isNonEmpty(c?.title) || !isNonEmpty(c?.subtitle)) return false;
  }
  const home = (pages as Record<string, unknown>).home as Record<string, unknown>;
  if (!isNonEmpty(home?.heroBadge) || !isNonEmpty(home?.heroDescription)) return false;
  return true;
}

function validateEvents(body: unknown): boolean {
  if (!Array.isArray(body)) return false;
  const ids = new Set<string>();
  for (const e of body) {
    if (!isNonEmpty(e?.id) || !SLUG_RE.test(e.id)) return false;
    if (!EVENT_TYPES.includes(e?.type)) return false;
    if (!isNonEmpty(e?.title) || !isNonEmpty(e?.lede)) return false;
    if (!isNonEmpty(e?.imageSlot) || !SLUG_RE.test(e.imageSlot)) return false;
    if (!Number.isInteger(e?.order)) return false;
    if (!Array.isArray(e?.pills)) return false;
    for (const p of e.pills) {
      if (!isNonEmpty(p?.label) || !isNonEmpty(p?.value)) return false;
    }
    if (!Array.isArray(e?.tags)) return false;
    if (ids.has(e.id)) return false;
    ids.add(e.id);
  }
  return true;
}

function validateCategories(body: unknown): boolean {
  if (!Array.isArray(body) || body.length === 0) return false;
  const ids = new Set<string>();
  for (const c of body) {
    if (!isNonEmpty(c?.id) || !SLUG_RE.test(c.id)) return false;
    if (c.id === 'uncategorized') return false;
    if (!isNonEmpty(c?.label)) return false;
    if (!Number.isInteger(c?.order)) return false;
    if (ids.has(c.id)) return false;
    ids.add(c.id);
  }
  return true;
}

const CONFIG: Record<string, { file: string; message: string; validate: (b: unknown) => boolean }> = {
  site:               { file: 'src/content/site.json',               message: 'chore: edit site config (via admin)',        validate: (b) => validateSite(b as Record<string, unknown>) },
  events:             { file: 'src/content/events.json',             message: 'chore: edit events (via admin)',             validate: validateEvents },
  'gallery-categories': { file: 'src/content/gallery-categories.json', message: 'chore: edit gallery categories (via admin)', validate: validateCategories },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const type = req.query.type as string;
  const cfg = CONFIG[type];
  if (!cfg) return res.status(404).json({ error: 'Not found' });

  let session;
  try {
    session = await getSession(req, res);
  } catch (err) {
    return res.status(500).json({ error: 'session_error', message: (err as Error).message });
  }
  if (!session.phone) return res.status(401).json({ error: 'Unauthorized' });

  if (!cfg.validate(req.body)) return res.status(400).json({ error: 'validation' });

  try {
    const { sha } = await getFile(cfg.file);
    await putFile(cfg.file, JSON.stringify(req.body, null, 2) + '\n', sha, cfg.message);
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err instanceof GitHubAuthError) return res.status(500).json({ error: 'github_auth' });
    return res.status(500).json({ error: 'github_other', message: (err as Error).message });
  }
}
