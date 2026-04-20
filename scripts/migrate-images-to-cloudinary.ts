/**
 * One-time migration: upload existing /public images to Cloudinary slots.
 * Run with: set -a && source .env.local && set +a && npx tsx scripts/migrate-images-to-cloudinary.ts
 *
 * Idempotent — re-running skips files already uploaded (by public_id).
 */
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import * as fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const ROOT = path.resolve(__dirname, '..', 'public');

type CollectionSpec = { folder: string; files: string[] };
type SingleSpec = { publicId: string; file: string };

const COLLECTIONS: CollectionSpec[] = [
  { folder: 'sanskaar/gallery/classroom',      files: ['gallery/classroom-01.jpg', 'gallery/classroom-02.jpg', 'gallery/classroom-03.jpg'] },
  { folder: 'sanskaar/gallery/practical-life', files: ['gallery/practical-life-01.jpg', 'gallery/practical-life-02.jpg'] },
  { folder: 'sanskaar/gallery/language',       files: ['gallery/language-kannada-02.jpg', 'gallery/language-english-02.jpg'] },
  { folder: 'sanskaar/gallery/mathematics',    files: ['gallery/mathematics-01.jpg', 'gallery/mathematics-02.jpg', 'gallery/mathematics-03.jpg'] },
  { folder: 'sanskaar/gallery/geography',      files: ['gallery/geography-01.jpg', 'gallery/geography-02.jpg'] },
  { folder: 'sanskaar/gallery/art-craft',      files: ['gallery/art-craft-01.jpg', 'gallery/art-craft-02.jpg'] },
  { folder: 'sanskaar/gallery/story-time',     files: ['gallery/story-time-01.jpg', 'gallery/story-time-02.jpg', 'gallery/story-time-03.jpg'] },
  { folder: 'sanskaar/gallery/gardening',      files: ['gallery/gardening-01.jpg', 'gallery/gardening-02.jpg', 'gallery/gardening-03.jpg'] },
];

const SINGLES: SingleSpec[] = [
  { publicId: 'sanskaar/events/summer-camp',  file: 'summer_camp.jpg' },
  { publicId: 'sanskaar/events/admissions',   file: 'gallery/admissions-01.jpg' },
  { publicId: 'sanskaar/events/day-care',     file: 'gallery/day-care-programme.jpg' },
  { publicId: 'sanskaar/events/after-school', file: 'gallery/after-school-programme.jpg' },
  { publicId: 'sanskaar/founders/sushma',     file: 'sushma.jpg' },
  { publicId: 'sanskaar/founders/shwetha',    file: 'shwetha.jpg' },
  { publicId: 'sanskaar/home/hero',           file: 'gallery/mathematics-03.jpg' },
];

async function exists(publicId: string): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId);
    return true;
  } catch {
    return false;
  }
}

async function uploadCollection(spec: CollectionSpec): Promise<void> {
  console.log(`\n=== ${spec.folder} ===`);
  for (let i = 0; i < spec.files.length; i++) {
    const filePath = path.join(ROOT, spec.files[i]);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (missing file): ${spec.files[i]}`);
      continue;
    }
    const sort = i + 1;
    const result = await cloudinary.uploader.upload(filePath, {
      folder: spec.folder,
      context: `sort=${sort}`,
      overwrite: false,
      resource_type: 'image',
    });
    console.log(`  uploaded sort=${sort}: ${result.public_id}`);
  }
}

async function uploadSingle(spec: SingleSpec): Promise<void> {
  const filePath = path.join(ROOT, spec.file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (missing file): ${spec.file}`);
    return;
  }
  if (await exists(spec.publicId)) {
    console.log(`SKIP (already uploaded): ${spec.publicId}`);
    return;
  }
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: spec.publicId,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`uploaded single: ${result.public_id}`);
}

async function main(): Promise<void> {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error('CLOUDINARY_API_SECRET not set — did you `source .env.local`?');
  }
  console.log('Migrating images to Cloudinary…');
  for (const c of COLLECTIONS) await uploadCollection(c);
  console.log('\n=== Singles ===');
  for (const s of SINGLES) await uploadSingle(s);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
