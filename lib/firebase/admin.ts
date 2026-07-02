import * as admin from 'firebase-admin';

// Initialized lazily so importing this module never requires credentials
// at build time (Next.js evaluates route modules during page-data collection).
function getAdminApp(): admin.app.App {
  if (admin.apps.length) {
    return admin.app();
  }

  const options = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  } as admin.ServiceAccount;

  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    (options as any).privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

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
