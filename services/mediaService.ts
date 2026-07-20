/**
 * Media Service — uploads/deletes files via the backend media API, which
 * stores them in object storage (Cloudflare R2) and returns a stable,
 * non-expiring URL safe to persist and use directly in <img src>.
 */
import { API_BASE_URL } from '@/utils/constants';
import { processImageBeforeUpload } from '@/utils/imageProcessor';

export interface UploadedMedia {
  key: string;
  url: string;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Client-side guard so we fail fast before hitting the network. */
export function validateImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG, WebP or GIF image.';
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return 'Image is too large (max 10 MB).';
  }
  return null;
}

/** Helper to extract S3/R2 key from a public stable media URL */
export function getMediaKeyFromUrl(url: string): string | null {
  if (!url) return null;
  const marker = '/media/file/';
  const index = url.indexOf(marker);
  if (index !== -1) {
    return url.substring(index + marker.length);
  }
  return null;
}

export async function uploadMedia(file: File, folder = 'general'): Promise<UploadedMedia> {
  // Compress and resize the image before uploading to optimize storage, bandwidth and quality
  const processedFile = await processImageBeforeUpload(file);

  const form = new FormData();
  form.append('file', processedFile);
  form.append('folder', folder);

  // NB: do NOT set Content-Type — the browser sets the multipart boundary.
  const res = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    body: form,
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }

  const json = await res.json();
  const data = json?.data ?? json; // API wraps payloads as { success, data }
  if (!data?.url || !data?.key) {
    throw new Error('Upload response missing url/key');
  }
  return { key: data.key, url: data.url };
}

export async function deleteMedia(key: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/media/${key}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Delete failed (${res.status})`);
  }
}

