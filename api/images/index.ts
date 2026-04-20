import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listImages, getImageByPublicId } from '../../src/lib/cloudinary';
import {
  isValidCategory,
  findSlot,
  folderPath,
  singlePublicId,
} from '../../src/content/image-slots';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const category = String(req.query.category ?? '');
  const slotId = String(req.query.slot ?? '');

  if (!isValidCategory(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }
  const slot = findSlot(category, slotId);
  if (!slot) {
    return res.status(400).json({ error: 'Invalid slot' });
  }

  try {
    if (slot.type === 'single') {
      // Single-slot images were uploaded with a fixed public_id and no folder
      // metadata, so folder-based search misses them. Search by exact public_id.
      const target = singlePublicId(category, slotId);
      const image = await getImageByPublicId(target);
      return res.status(200).json({ images: image ? [image] : [] });
    }

    const images = await listImages(folderPath(category, slotId));
    return res.status(200).json({ images });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
