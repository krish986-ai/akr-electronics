import { getAdminDb } from '@/lib/firebase/admin';

// Extra password (beyond admin login) for high-risk admin actions: changing
// the payment QR and permanently deleting orders.
//
// This used to be a hardcoded source-file constant that the "change password"
// route rewrote with `fs.writeFile` at request time. That fails outright in
// production — Vercel serverless functions have a read-only filesystem — and
// even locally it would only patch the one running instance's memory, not
// actually roll out anywhere. It's stored in Firestore instead, in a
// collection with no security-rule match (falls through to the default
// deny-all), so it's reachable only via the Admin SDK on the server, never
// from a client.
const SECRETS_DOC = ['adminSecrets', 'action'] as const;
const FALLBACK_PASSWORD = process.env.ADMIN_ACTION_PASSWORD_DEFAULT ?? 'AKR-ANMOL@123';

export async function getAdminActionPassword(): Promise<string> {
  const snapshot = await getAdminDb().collection(SECRETS_DOC[0]).doc(SECRETS_DOC[1]).get();
  const stored = snapshot.data()?.password;
  return typeof stored === 'string' && stored.length > 0 ? stored : FALLBACK_PASSWORD;
}

export async function setAdminActionPassword(newPassword: string): Promise<void> {
  await getAdminDb()
    .collection(SECRETS_DOC[0])
    .doc(SECRETS_DOC[1])
    .set({ password: newPassword, updatedAt: new Date() }, { merge: true });
}
