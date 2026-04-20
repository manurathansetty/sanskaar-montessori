import { v2 as cloudinary } from 'cloudinary';

export type CloudinaryResource = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  context?: { custom?: { sort?: string; alt?: string } };
};

function ensureConfigured(): void {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) {
    throw new Error(
      'Cloudinary env not configured: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are all required.'
    );
  }
  cloudinary.config({
    cloud_name: cloud,
    api_key: key,
    api_secret: secret,
    secure: true,
  });
}

export type SignUploadInput = {
  folder: string;
  publicId?: string;
  overwrite?: boolean;
  defaultSort?: number;
};

export type SignedUploadParams = {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id?: string;
  overwrite?: boolean;
  context?: string;
};

export function signUploadParams(input: SignUploadInput): SignedUploadParams {
  ensureConfigured();
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number | boolean> = {
    timestamp,
    folder: input.folder,
  };
  if (input.publicId) params.public_id = input.publicId;
  if (input.overwrite) params.overwrite = true;
  if (typeof input.defaultSort === 'number') {
    params.context = `sort=${input.defaultSort}`;
  }
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: input.folder,
    public_id: input.publicId,
    overwrite: input.overwrite,
    context: typeof params.context === 'string' ? params.context : undefined,
  };
}

export async function listImages(folder: string): Promise<CloudinaryResource[]> {
  ensureConfigured();
  const result = await cloudinary.search
    .expression(`folder="${folder}"`)
    .with_field('context')
    .max_results(100)
    .execute();
  const resources = (result.resources ?? []) as CloudinaryResource[];
  return resources.sort((a, b) => {
    const sa = parseInt(a.context?.custom?.sort ?? '0', 10);
    const sb = parseInt(b.context?.custom?.sort ?? '0', 10);
    return sa - sb;
  });
}

// Lists every image under any subfolder of `prefix` (recursive). Used by the
// batch /api/images/category endpoint so the public Gallery page makes one
// Cloudinary call instead of one per slot.
export async function listImagesByPrefix(
  prefix: string
): Promise<CloudinaryResource[]> {
  ensureConfigured();
  const result = await cloudinary.search
    .expression(`folder:${prefix}/*`)
    .with_field('context')
    .max_results(500)
    .execute();
  return (result.resources ?? []) as CloudinaryResource[];
}

export async function setImageSort(
  publicId: string,
  sort: number
): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.add_context(`sort=${sort}`, [publicId]);
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { invalidate: true });
}

export async function renameImage(fromPublicId: string, toPublicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.rename(fromPublicId, toPublicId, { overwrite: false, invalidate: true });
}
