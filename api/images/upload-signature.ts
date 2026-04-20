import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSession } from '../../src/lib/session';
import { signUploadParams, listImages } from '../../src/lib/cloudinary';
import {
  isValidCategory,
  findSlot,
  folderPath,
} from '../../src/content/image-slots';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
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
  if (!session.phone) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { category, slot: slotId, count: rawCount } = (req.body ?? {}) as {
    category?: unknown;
    slot?: unknown;
    count?: unknown;
  };
  const count = Math.max(1, Math.min(20, Number(rawCount) || 1));

  if (typeof category !== 'string' || typeof slotId !== 'string') {
    return res.status(400).json({ error: 'Missing category or slot' });
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const slot = findSlot(category, slotId);
  if (!slot) {
    return res.status(400).json({ error: 'Invalid slot' });
  }

  try {
    if (slot.type === 'single') {
      // Single slots only ever hold one image — ignore count > 1.
      const params = signUploadParams({
        folder: `sanskaar/${category}`,
        publicId: slotId,
        overwrite: true,
      });
      return res.status(200).json([params]);
    }

    // Collection: fetch existing once, generate `count` signatures with
    // sequential sort values so parallel uploads land in submission order.
    const existing = await listImages(folderPath(category, slotId));
    const maxSort = existing.reduce((m, img) => {
      const s = parseInt(img.context?.custom?.sort ?? '0', 10);
      return s > m ? s : m;
    }, 0);
    const sigs = Array.from({ length: count }, (_, i) =>
      signUploadParams({
        folder: folderPath(category, slotId),
        defaultSort: maxSort + 1 + i,
      })
    );
    return res.status(200).json(sigs);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
