export interface UploadOptions {
  name?: string;
  maxSize?: number;
  allowedMimes?: string[];
}

export interface StorageFile {
  path: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface IStorageProvider {
  upload(file: Buffer, category: string, options?: UploadOptions): Promise<StorageFile>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
  exists(path: string): Promise<boolean>;
}

export type StorageCategory = 'products' | 'categories' | 'brands' | 'kits' | 'banners' | 'website' | 'avatars';
