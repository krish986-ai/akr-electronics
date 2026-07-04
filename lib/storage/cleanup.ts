import { getAdminDb, getAdminStorage } from '@/lib/firebase/admin';

// Removes a previously uploaded image when it is replaced or its owner is
// deleted. Handles both hosting schemes: Firestore-backed /api/images/<id>
// paths and Firebase Storage public URLs. External URLs are left alone.
export async function deleteHostedImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (url.startsWith('/api/images/')) {
      const id = decodeURIComponent(url.slice('/api/images/'.length));
      await getAdminDb().collection('images').doc(id).delete();
      return;
    }
    const storageMatch = url.match(/^https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)$/);
    if (storageMatch) {
      await getAdminStorage()
        .bucket(storageMatch[1])
        .file(decodeURIComponent(storageMatch[2]))
        .delete();
    }
  } catch {
    // Image already gone — nothing to clean up
  }
}
