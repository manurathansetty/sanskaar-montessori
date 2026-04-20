import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { getFile, GitHubAuthError } from '../../src/lib/github';

const ALLOWED = new Set(['site', 'events', 'gallery-categories']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const file = req.query.file as string;
  if (!ALLOWED.has(file)) return res.status(404).json({ error: 'Not found' });

  let session;
  try {
    session = await getSession(req, res);
  } catch (err) {
    return res.status(500).json({ error: 'session_error', message: (err as Error).message });
  }
  if (!session.phone) return res.status(401).json({ error: 'Unauthorized' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { content } = await getFile(`src/content/${file}.json`);
    return res.status(200).json(JSON.parse(content));
  } catch (err) {
    if (err instanceof GitHubAuthError) return res.status(500).json({ error: 'github_auth' });
    return res.status(500).json({ error: 'github_other' });
  }
}
