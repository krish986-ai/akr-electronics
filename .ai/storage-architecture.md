# Image Storage Architecture

## Overview

A provider-based image storage service that abstracts filesystem operations, allowing seamless switching between storage implementations (local filesystem, Firebase Storage, AWS S3, etc.) without changing application code.

**Status**: Production-Ready (Local Implementation)  
**Date**: 2026-06-28

---

## Architecture

### Provider Pattern

```
Application Code
    ↓
StorageService (Facade)
    ↓
IStorageProvider (Interface)
    ↓
LocalStorageProvider (Implementation)
    ↓
Local Filesystem (public/uploads)
```

### Dependency Injection

```typescript
// Default: Uses LocalStorageProvider
const storage = new StorageService();

// Custom: Can inject any implementation
const customStorage = new StorageService(new FirebaseProvider());
```

---

## Directory Structure

```
public/
├── uploads/
│   ├── products/     # Product images
│   ├── categories/   # Category thumbnails
│   ├── brands/       # Brand logos
│   ├── kits/         # IoT kit images
│   ├── banners/      # Website banners
│   ├── website/      # General website assets
│   └── avatars/      # User profile pictures
```

All directories are created automatically on first upload.

---

## API

### StorageService Interface

```typescript
interface IStorageProvider {
  upload(file: Buffer, category: StorageCategory, options?: UploadOptions): Promise<StorageFile>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
  exists(path: string): Promise<boolean>;
}

type StorageCategory = 'products' | 'categories' | 'brands' | 'kits' | 'banners' | 'website' | 'avatars';
```

### StorageService Methods

```typescript
// Upload image
const file = await storageService.uploadImage(buffer, 'products', {
  name: 'my-product.jpg',
  maxSize: 5 * 1024 * 1024,
  allowedMimes: ['image/jpeg', 'image/png']
});
// Returns: { path, url, name, size, mimeType, uploadedAt }

// Delete image
await storageService.deleteImage('products/image-123.jpg');

// Get URL for image
const url = storageService.getImageUrl('products/image-123.jpg');
// Returns: '/uploads/products/image-123.jpg'

// Check if image exists
const exists = await storageService.imageExists('products/image-123.jpg');

// Delete multiple images
await storageService.deleteMultiple([
  'products/image-1.jpg',
  'products/image-2.jpg'
]);
```

---

## Usage Example

### Upload Endpoint

```typescript
import { storageService } from '@/lib/storage/storage-service';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const category = formData.get('category') as string;

  // Validate file
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Upload through storage service
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await storageService.uploadImage(buffer, category);

  return NextResponse.json(result);
}
```

### Display Image

```typescript
// Use the URL returned from upload
<img src={product.thumbnailImage} alt={product.name} />
```

### Product Update

```typescript
import { storageService } from '@/lib/storage/storage-service';

// When updating product with new image
const oldImagePath = product.thumbnailImage;

// Upload new image
const newImage = await storageService.uploadImage(buffer, 'products');

// Update product
await prisma.product.update({
  where: { id: productId },
  data: { thumbnailImage: newImage.url }
});

// Delete old image
if (oldImagePath) {
  await storageService.deleteImage(oldImagePath);
}
```

---

## File Validation

### Client-Side

```typescript
import { validateImageFile } from '@/lib/validation/image-validation';

const input = document.querySelector('input[type="file"]');
const file = input.files[0];
const validation = validateImageFile(file);

if (!validation.isValid) {
  alert(validation.error);
}
```

### Server-Side

All uploads are validated server-side:
- File size (max 5MB)
- MIME types (JPEG, PNG, WebP, GIF)
- Magic bytes verification

---

## Filename Generation

Filenames are automatically generated:

```
{timestamp}-{random}.{extension}
Example: 1719555600000-abc123.jpg
```

Benefits:
- Prevents filename collisions
- Obfuscates file paths
- Secure random component
- Preserves original extension

---

## Future: Firebase Storage Integration

To switch to Firebase Storage:

```typescript
import { IStorageProvider, StorageFile, UploadOptions } from './types';

export class FirebaseStorageProvider implements IStorageProvider {
  async upload(file: Buffer, category: string, options?: UploadOptions): Promise<StorageFile> {
    const bucket = admin.storage().bucket();
    const path = `uploads/${category}/${this.generateFilename(options?.name)}`;
    
    await bucket.file(path).save(file);
    
    return {
      path,
      url: `https://storage.googleapis.com/${bucket.name}/${path}`,
      // ... rest of properties
    };
  }

  // ... implement other methods
}
```

Then update StorageService:

```typescript
const provider = new FirebaseStorageProvider();
const storage = new StorageService(provider);
```

**No other code needs to change!**

---

## Security

### File Validation
- Magic bytes verification
- MIME type checking
- File size limits
- Filename sanitization

### Access Control
- Public: `/uploads/...` (served by Next.js static)
- Future: Can implement authenticated access via Storage Rules

### Path Traversal Prevention
- Filenames sanitized
- Category validation
- No direct user control over paths

---

## Performance

### Current (Local)
- Instant upload (local disk)
- Fast retrieval (local disk)
- No network latency

### Future (Firebase)
- Leverages CDN
- Automatic image optimization
- Caching rules
- Geographic distribution

---

## Caching Considerations

Filenames are immutable (timestamp-based), so:
- Set long cache headers: `Cache-Control: public, max-age=31536000`
- Next.js automatically handles this for static files

---

## Error Handling

All operations throw descriptive errors:

```typescript
try {
  await storageService.uploadImage(buffer, 'products');
} catch (error) {
  console.error(error.message);
  // "File size exceeds 5MB limit"
  // "File type not allowed. Allowed: image/jpeg, image/png..."
  // "File is empty"
}
```

---

## Testing

### Unit Tests (Ready)
```typescript
const service = new StorageService();
const buffer = Buffer.from('fake image data');
const result = await service.uploadImage(buffer, 'products');

expect(result).toHaveProperty('url');
expect(result).toHaveProperty('path');
expect(result).toHaveProperty('uploadedAt');
```

### Integration Tests
```typescript
// Upload image
const uploaded = await uploadImageAPI({ file, category: 'products' });

// Verify file exists
expect(await storageService.imageExists(uploaded.path)).toBe(true);

// Delete image
await storageService.deleteImage(uploaded.path);

// Verify deletion
expect(await storageService.imageExists(uploaded.path)).toBe(false);
```

---

## API Endpoint

**POST** `/api/upload`

**Request**:
```
Content-Type: multipart/form-data
- file: File
- category: 'products' | 'categories' | 'brands' | 'kits' | 'banners' | 'website' | 'avatars'
```

**Response**:
```json
{
  "path": "products/1719555600000-abc123.jpg",
  "url": "/uploads/products/1719555600000-abc123.jpg",
  "name": "1719555600000-abc123.jpg",
  "size": 245890,
  "mimeType": "image/jpeg",
  "uploadedAt": "2026-06-28T10:30:00.000Z"
}
```

---

## Migration Path

### Phase 1 (Current): Local Storage
- Development and testing
- Free, no external dependencies
- Perfect for MVP

### Phase 2 (Future): Firebase Storage
- Production deployment
- Automatic CDN
- Image optimization
- Geographic distribution

### Phase 3 (Optional): AWS S3 / Cloudflare R2
- Alternative providers
- Same interface, different implementation

---

## Checklist

✅ Provider pattern implemented  
✅ Local storage provider  
✅ File validation  
✅ Directory management  
✅ Error handling  
✅ Upload API endpoint  
✅ Magic bytes verification  
✅ Future-proof architecture  

---

**Architecture Decision**: Use provider pattern to abstract storage implementation, enabling free local development with easy migration to cloud storage later.

**Key Principle**: All image operations go through StorageService—the application never touches the filesystem directly.
