import { getAdminDb } from '../firebase/admin';
import { IStorageProvider, StorageFile, UploadOptions } from './types';
import { validateFileBuffer, generateFilename, detectMimeFromFilename } from './file-utils';

// Firebase Storage requires the paid Blaze plan, so images live in Firestore
// instead: base64 docs in the `images` collection (safe for files under the
// 400 KB upload cap; Firestore docs allow 1 MB) served via /api/images/[id]
// with immutable cache headers.
export class FirestoreStorageProvider implements IStorageProvider {
  async upload(file: Buffer, category: string, options?: UploadOptions): Promise<StorageFile> {
    validateFileBuffer(file, options);

    const filename = generateFilename(options?.name);
    const mimeType = detectMimeFromFilename(options?.name ?? filename);
    const id = `${category}-${filename}`;
    const uploadedAt = new Date();

    await getAdminDb().collection('images').doc(id).set({
      data: file.toString('base64'),
      mimeType,
      name: filename,
      size: file.length,
      category,
      uploadedAt,
    });

    return {
      path: id,
      url: this.getUrl(id),
      name: filename,
      size: file.length,
      mimeType,
      uploadedAt,
    };
  }

  async delete(path: string): Promise<void> {
    try {
      await getAdminDb().collection('images').doc(path).delete();
    } catch {
      // Already gone
    }
  }

  getUrl(path: string): string {
    return `/api/images/${encodeURIComponent(path)}`;
  }

  async exists(path: string): Promise<boolean> {
    const doc = await getAdminDb().collection('images').doc(path).get();
    return doc.exists;
  }
}
