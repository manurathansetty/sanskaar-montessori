import type { VercelRequest, VercelResponse } from '@vercel/node';
import { listImages } from '../../src/lib/cloudinary';
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

  // For both collection and single slots we list the same folder.
  // Single slots will return 0 or 1 image.
  const folder =
    slot.type === 'single'
      ? `sanskaar/${category}` // single: parent folder, then filter by public_id
      : folderPath(category, slotId);

  try {
    const images = await listImages(folder);
    if (slot.type === 'single') {
      const target = singlePublicId(category, slotId);
      const match = images.filter((img) => img.public_id === target);
      return res.status(200).json({ images: match });
    }
    return res.status(200).json({ images });
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
}
