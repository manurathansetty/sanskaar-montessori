# Admin Auth — Deployment Notes

## Required env vars (set in Vercel dashboard)

In **Vercel project → Settings → Environment Variables**, add three vars to
both Preview and Production scopes:

| Name             | Example                                    | Notes                                       |
|------------------|--------------------------------------------|---------------------------------------------|
| `ADMIN_PASSWORD` | (chosen by client)                         | Single shared password for both phones      |
| `ADMIN_PHONES`   | `+919113805407,+918105358074`              | Comma-separated, normalized E.164 format    |
| `SESSION_SECRET` | generate with `openssl rand -hex 32`       | At least 32 chars; do not reuse across envs |

After saving, redeploy the project for the new vars to take effect.

## Local dev

1. Copy `.env.local.example` to `.env.local` and fill in real values.
2. Run `npm run dev` (which runs `vercel dev`) — serves CRA + API routes on
   a single port (default 3000).
3. Visit `http://localhost:3000/admin` — should redirect to `/admin/login`.

## Resetting the password

Change `ADMIN_PASSWORD` in Vercel dashboard → redeploy. Existing sessions
remain valid until their 24-hour expiry; if you need to force logout
immediately, also rotate `SESSION_SECRET` (this invalidates all cookies).

## Adding a third admin phone

Edit `ADMIN_PHONES` env var, append the new normalized number with a comma
separator, redeploy. No code change.
