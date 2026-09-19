// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUserId?: number;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    if (decodedToken.uid && decodedToken.email) {
      try {
        const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email);
        req.dbUserId = dbUser.id;
      } catch (dbErr) {
        console.error('Error syncing user to Cloud SQL:', dbErr);
      }
    }
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Optional auth middleware for routes that can work for both logged-in and guest users
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
      if (decodedToken.uid && decodedToken.email) {
        try {
          const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email);
          req.dbUserId = dbUser.id;
        } catch (dbErr) {
          console.error('Error syncing user to Cloud SQL:', dbErr);
        }
      }
    } catch {
      // Ignore token verification errors for optional auth
    }
  }
  next();
};
