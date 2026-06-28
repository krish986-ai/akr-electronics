import { promises as fs } from 'fs';
import path from 'path';
import { IStorageProvider, StorageFile, UploadOptions, StorageCategory } from './types';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export class LocalStorageProvider implements IStorageProvider {
  private baseUrl = '/uploads';

  async upload(
    file: Buffer,
    category: StorageCategory,
    options?: UploadOptions
  ): Promise<StorageFile> {
    this.validateFile(file, options);

    const filename = this.generateFilename(options?.name);
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
      mimeType: this.detectMimeType(filename),
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

  private validateFile(file: Buffer, options?: UploadOptions): void {
    const maxSize = options?.maxSize || MAX_FILE_SIZE;
    const allowedMimes = options?.allowedMimes || ALLOWED_MIMES;

    if (file.length > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    // Check magic bytes for mime type validation
    const detectedMime = this.detectMimeFromBuffer(file);
    if (!allowedMimes.includes(detectedMime)) {
      throw new Error(`File type not allowed. Allowed: ${allowedMimes.join(', ')}`);
    }
  }

  private generateFilename(originalName?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = originalName ? path.extname(originalName) : '.jpg';
    return `${timestamp}-${random}${ext}`;
  }

  private detectMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    return mimeMap[ext] || 'image/jpeg';
  }

  private detectMimeFromBuffer(buffer: Buffer): string {
    // Magic bytes detection
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
    if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
    if (buffer.slice(0, 4).toString('utf-8', 0, 4) === 'RIFF') return 'image/webp';
    return 'image/jpeg';
  }

  private async ensureDirectory(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }
}
