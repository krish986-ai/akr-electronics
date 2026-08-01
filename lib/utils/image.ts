// Product/category/partner images come from admin-entered data (Firestore),
// which can contain malformed values like "https://" (a bare protocol with
// no host) — harmless for a plain <img> but next/image throws a hard
// TypeError constructing a URL from it. Route anything not guaranteed-valid
// through this before handing it to next/image.
export const FALLBACK_IMAGE = '/images/placeholder-capacitor.svg';

export function isValidImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  if (src.startsWith('/')) return true;
  try {
    new URL(src);
    return true;
  } catch {
    return false;
  }
}

export function safeImageSrc(src: string | null | undefined): string {
  return isValidImageSrc(src) ? (src as string) : FALLBACK_IMAGE;
}
