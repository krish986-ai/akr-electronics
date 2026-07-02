import { getAdminStorage } from '../firebase/admin';
import { IStorageProvider, StorageFile, UploadOptions, StorageCategory } from './types';
import { validateFileBuffer, generateFilename, detectMimeFromFilename } from './file-utils';

export class FirebaseStorageProvider implements IStorageProvider {
  private get bucket() {
    return getAdminStorage().bucket();
  }

  async upload(
    file: Buffer,
    category: StorageCategory,
    options?: UploadOptions
  ): Promise<StorageFile> {
    validateFileBuffer(file, options);

    const filename = generateFilename(options?.name);
    const storagePath = `uploads/${category}/${filename}`;
    const mimeType = detectMimeFromFilename(filename);
    const fileRef = this.bucket.file(storagePath);

    await fileRef.save(file, {
      resumable: false,
      contentType: mimeType,
      metadata: {
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
    await fileRef.makePublic();

    return {
      path: storagePath,
      url: this.getUrl(storagePath),
      name: filename,
      size: file.length,
      mimeType,
      uploadedAt: new Date(),
    };
  }

  async delete(path: string): Promise<void> {
    try {
      await this.bucket.file(path).delete();
    } catch {
      // File doesn't exist, ignore
    }
  }

  getUrl(path: string): string {
    return `https://storage.googleapis.com/${this.bucket.name}/${path}`;
  }

  async exists(path: string): Promise<boolean> {
    const [exists] = await this.bucket.file(path).exists();
    return exists;
  }
}
