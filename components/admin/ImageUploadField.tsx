'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { adminUpload } from '@/lib/api/admin-client';
import { MAX_IMAGE_SIZE_KB } from '@/lib/validation/image-validation';
import { StorageCategory } from '@/lib/storage/types';
import { isValidImageSrc } from '@/lib/utils/image';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  category: StorageCategory;
  onError: (message: string) => void;
  placeholder?: string;
}

const inputCls =
  'w-full h-10 rounded-lg border border-neutral-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500';

export function validateImageForUpload(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Only image files can be uploaded';
  }
  if (file.size > MAX_IMAGE_SIZE_KB * 1024) {
    return `Image is ${Math.round(file.size / 1024)} KB — it must be under ${MAX_IMAGE_SIZE_KB} KB`;
  }
  return null;
}

export function ImageUploadField({
  value,
  onChange,
  category,
  onError,
  placeholder,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const validationError = validateImageForUpload(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setUploading(true);
    onError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      const result = await adminUpload<{ url: string }>('/api/upload', formData);
      onChange(result.url);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        {isValidImageSrc(value) && (
          <Image
            src={value}
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
          />
        )}
        <input
          className={inputCls}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://... or upload'}
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-10 px-3 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {uploading ? 'Uploading...' : '📤 Upload'}
        </button>
      </div>
      <p className="text-[11px] text-neutral-500 mt-1">
        Any image type, max {MAX_IMAGE_SIZE_KB} KB — uploads straight to the store
      </p>
    </div>
  );
}
