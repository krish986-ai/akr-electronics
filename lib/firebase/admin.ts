import * as admin from 'firebase-admin';

// Initialized lazily so importing this module never requires credentials
// at build time (Next.js evaluates route modules during page-data collection).
function getAdminApp(): admin.app.App {
  if (admin.apps.length) {
    return admin.app();
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.trim()
    : undefined;

  const sanitizedPrivateKey = privateKey
    ? privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
    : undefined;

  const options = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: sanitizedPrivateKey,
  } as admin.ServiceAccount;

  return admin.initializeApp({
    credential: admin.credential.cert(options),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

export function getAdminDb(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export function getAdminStorage(): admin.storage.Storage {
  return getAdminApp().storage();
}

export default getAdminApp;
