import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export type SessionData = {
  phone?: string;
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || '',
  cookieName: 'sm_admin_session',
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
