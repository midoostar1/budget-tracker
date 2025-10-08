import { NextFunction, Request, Response } from 'express';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let appInitialized = false;

export function firebaseAuthMiddleware() {
  if (!appInitialized) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    appInitialized = true;
  }

  return async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const idToken = authHeader.slice('Bearer '.length);
    try {
      const decoded = await getAuth().verifyIdToken(idToken);
      (req as any).user = decoded;
      return next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
