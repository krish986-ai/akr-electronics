import { IStorageProvider, StorageFile, UploadOptions, StorageCategory } from './types';
import { LocalStorageProvider } from './local-storage';
import { FirebaseStorageProvider } from './firebase-storage';
import { FirestoreStorageProvider } from './firestore-storage';

// Vercel's serverless filesystem is read-only and ephemeral, so local disk
// storage only works in development without Firebase credentials. Firestore
// holds uploaded images by default (Firebase Storage needs the paid Blaze
// plan and no bucket is provisioned); STORAGE_PROVIDER can force a provider.
function createDefaultProvider(): IStorageProvider {
  if (process.env.STORAGE_PROVIDER === 'firebase') return new FirebaseStorageProvider();
  if (process.env.STORAGE_PROVIDER === 'local') return new LocalStorageProvider();
  if (process.env.FIREBASE_ADMIN_PROJECT_ID) return new FirestoreStorageProvider();
  return new LocalStorageProvider();
}

class StorageService {
  private provider: IStorageProvider;

  constructor(provider?: IStorageProvider) {
    this.provider = provider || createDefaultProvider();
  }

  setProvider(provider: IStorageProvider): void {
    this.provider = provider;
  }

  async uploadImage(
    file: Buffer,
    category: StorageCategory,
    options?: UploadOptions
  ): Promise<StorageFile> {
    if (!file || file.length === 0) {
      throw new Error('File is empty');
    }

    return this.provider.upload(file, category, options);
  }

  async deleteImage(path: string): Promise<void> {
    if (!path) {
      throw new Error('Path is required');
    }

    return this.provider.delete(path);
  }

  getImageUrl(path: string): string {
    if (!path) {
      throw new Error('Path is required');
    }

    return this.provider.getUrl(path);
  }

  async imageExists(path: string): Promise<boolean> {
    if (!path) {
      return false;
    }

    return this.provider.exists(path);
  }

  async deleteMultiple(paths: string[]): Promise<void> {
    await Promise.all(paths.map(path => this.provider.delete(path).catch(() => null)));
  }
}

export const storageService = new StorageService();
