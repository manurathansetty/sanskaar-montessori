import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { getFile, GitHubAuthError } from '../../src/lib/github';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const session = await getSession(req, res);
  if (!session.phone) return res.status(401).json({ error: 'Unauthorized' });
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { content } = await getFile('src/content/gallery-categories.json');
    return res.status(200).json(JSON.parse(content));
  } catch (err) {
    if (err instanceof GitHubAuthError) return res.status(500).json({ error: 'github_auth' });
    return res.status(500).json({ error: 'github_other' });
  }
}
