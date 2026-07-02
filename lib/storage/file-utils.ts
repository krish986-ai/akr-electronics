import path from 'path';
import { UploadOptions } from './types';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateFileBuffer(file: Buffer, options?: UploadOptions): void {
  const maxSize = options?.maxSize || MAX_FILE_SIZE;
  const allowedMimes = options?.allowedMimes || ALLOWED_MIMES;

  if (file.length > maxSize) {
    throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
  }

  const detectedMime = detectMimeFromBuffer(file);
  if (!allowedMimes.includes(detectedMime)) {
    throw new Error(`File type not allowed. Allowed: ${allowedMimes.join(', ')}`);
  }
}

export function generateFilename(originalName?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName ? path.extname(originalName) : '.jpg';
  return `${timestamp}-${random}${ext}`;
}

export function detectMimeFromFilename(filename: string): string {
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

export function detectMimeFromBuffer(buffer: Buffer): string {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  if (buffer.slice(0, 4).toString('utf-8', 0, 4) === 'RIFF') return 'image/webp';
  return 'image/jpeg';
}
