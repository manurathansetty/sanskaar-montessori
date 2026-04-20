import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type SessionData = {
  phone?: string;
};

// SESSION_SECRET is read at module load. Rotation requires a redeploy.
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || '',
  cookieName: 'sm_admin_session',
  ttl: 60 * 60 * 24, // payload TTL matches cookie maxAge so the two expire together
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  },
};

export async function getSession(
  req: VercelRequest,
  res: VercelResponse
): Promise<IronSession<SessionData>> {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error(
      'SESSION_SECRET env var is missing or shorter than 32 characters.'
    );
  }
  return getIronSession<SessionData>(req, res, sessionOptions);
}
