import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listImagesByPrefix, type CloudinaryResource } from '../../src/lib/cloudinary';
import { isValidCategory, SLOTS } from '../../src/content/image-slots';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const category = String(req.query.category ?? '');
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const all = await listImagesByPrefix(`sanskaar/${category}`);

    // Initialize an empty bucket per slot so the response shape is stable
    // even when a slot has zero images.
    const slots: Record<string, CloudinaryResource[]> = {};
    for (const slot of SLOTS[category]) {
      slots[slot.id] = [];
    }

    // public_id shapes:
    //   sanskaar/<category>/<slotId>            (single)
    //   sanskaar/<category>/<slotId>/<random>   (collection)
    // In both cases parts[2] is the slot id.
    for (const img of all) {
      const parts = img.public_id.split('/');
      if (parts.length < 3) continue;
      const slotId = parts[2];
      if (!(slotId in slots)) continue;
      slots[slotId].push(img);
    }

    for (const slotId of Object.keys(slots)) {
      slots[slotId].sort((a, b) => {
        const sa = parseInt(a.context?.custom?.sort ?? '0', 10);
        const sb = parseInt(b.context?.custom?.sort ?? '0', 10);
        return sa - sb;
      });
    }

    return res.status(200).json({ slots });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
