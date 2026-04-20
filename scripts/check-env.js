#!/usr/bin/env node
// Runs before `npm run build`. Fails the build (exit 1) if any required
// server env var is missing, so Vercel never deploys broken functions.

const REQUIRED = [
  { key: 'SESSION_SECRET',              minLen: 32, hint: 'Must be at least 32 characters' },
  { key: 'ADMIN_PASSWORD',              hint: 'Admin login password' },
  { key: 'ADMIN_PHONES',               hint: 'Comma-separated admin phone numbers' },
  { key: 'GITHUB_TOKEN',               hint: 'GitHub PAT for content read/write' },
  { key: 'GITHUB_BRANCH',              hint: 'GitHub branch for content (e.g. master)' },
  { key: 'CLOUDINARY_CLOUD_NAME',      hint: 'Cloudinary cloud name' },
  { key: 'CLOUDINARY_API_KEY',         hint: 'Cloudinary API key' },
  { key: 'CLOUDINARY_API_SECRET',      hint: 'Cloudinary API secret' },
  { key: 'REACT_APP_CLOUDINARY_CLOUD_NAME', hint: 'Cloudinary cloud name (public/React)' },
];

let failed = false;

for (const { key, minLen, hint } of REQUIRED) {
  const val = process.env[key];
  if (!val) {
    console.error(`  MISSING  ${key}  —  ${hint}`);
    failed = true;
  } else if (minLen && val.length < minLen) {
    console.error(`  TOO SHORT  ${key}  (got ${val.length} chars, need ${minLen})  —  ${hint}`);
    failed = true;
  }
}

if (failed) {
  console.error('\nBuild aborted: set the missing env vars in Vercel → Settings → Environment Variables, then redeploy.');
  process.exit(1);
}

console.log('All required env vars present. Proceeding with build.');
