import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const options = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  } as admin.ServiceAccount;

  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    (options as any).privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(options),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();

export default admin;
