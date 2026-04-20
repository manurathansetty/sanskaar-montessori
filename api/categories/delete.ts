import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { getFile, putFile, GitHubAuthError } from '../../src/lib/github';
import { listImagesByPrefix, renameImage } from '../../src/lib/cloudinary';

type Category = { id: string; label: string; description: string; order: number };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let session;
  try {
    session = await getSession(req, res);
  } catch (err) {
    return res.status(500).json({ error: 'session_error', message: (err as Error).message });
  }
  if (!session.phone) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = (req.body ?? {}) as { id?: unknown };
  if (typeof id !== 'string' || !id) return res.status(400).json({ error: 'validation' });
  if (id === 'uncategorized') return res.status(400).json({ error: 'validation' });

  try {
    const { content, sha } = await getFile('src/content/gallery-categories.json');
    const cats: Category[] = JSON.parse(content);
    const target = cats.find((c) => c.id === id);
    if (!target) return res.status(400).json({ error: 'validation' });

    // Move photos to uncategorized BEFORE committing the JSON change
    const photos = await listImagesByPrefix(`sanskaar/gallery/${id}`);
    for (const photo of photos) {
      const parts = photo.public_id.split('/');
      const leaf = parts[parts.length - 1];
      const newPublicId = `sanskaar/gallery/uncategorized/${leaf}`;
      await renameImage(photo.public_id, newPublicId);
    }

    const updated = cats.filter((c) => c.id !== id);
    await putFile(
      'src/content/gallery-categories.json',
      JSON.stringify(updated, null, 2) + '\n',
      sha,
      `chore: delete category "${target.label}", moved ${photos.length} photos to uncategorized (via admin)`
    );

    return res.status(200).json({ ok: true, moved: photos.length });
  } catch (err) {
    if (err instanceof GitHubAuthError) return res.status(500).json({ error: 'github_auth' });
    const msg = (err as Error).message;
    if (msg.toLowerCase().includes('cloudinary') || msg.toLowerCase().includes('rename')) {
      return res.status(500).json({ error: 'cloudinary', message: msg });
    }
    return res.status(500).json({ error: 'github_other', message: msg });
  }
}
