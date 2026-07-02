import { promises as fs } from 'fs';
import path from 'path';
import { IStorageProvider, StorageFile, UploadOptions, StorageCategory } from './types';
import { validateFileBuffer, generateFilename, detectMimeFromFilename } from './file-utils';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export class LocalStorageProvider implements IStorageProvider {
  private baseUrl = '/uploads';

  async upload(
    file: Buffer,
    category: StorageCategory,
    options?: UploadOptions
  ): Promise<StorageFile> {
    validateFileBuffer(file, options);

    const filename = generateFilename(options?.name);
    const categoryPath = path.join(UPLOAD_DIR, category);
    const filePath = path.join(categoryPath, filename);
    const relativePath = path.join(category, filename);

    await this.ensureDirectory(categoryPath);
    await fs.writeFile(filePath, file);

    return {
      path: relativePath.replace(/\\/g, '/'),
      url: `${this.baseUrl}/${relativePath.replace(/\\/g, '/')}`,
      name: filename,
      size: file.length,
      mimeType: detectMimeFromFilename(filename),
      uploadedAt: new Date(),
    };
  }

  async delete(path: string): Promise<void> {
    const filePath = `${UPLOAD_DIR}/${path}`;
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // File doesn't exist, ignore
    }
  }

  getUrl(path: string): string {
    return `${this.baseUrl}/${path}`;
  }

  async exists(path: string): Promise<boolean> {
    const filePath = `${UPLOAD_DIR}/${path}`;
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }
}
