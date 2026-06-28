import { IStorageProvider, StorageFile, UploadOptions, StorageCategory } from './types';
import { LocalStorageProvider } from './local-storage';

class StorageService {
  private provider: IStorageProvider;

  constructor(provider?: IStorageProvider) {
    this.provider = provider || new LocalStorageProvider();
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
