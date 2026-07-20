/**
 * Media Service — uploads/deletes files via the backend media API, which
 * stores them in object storage (Cloudflare R2) and returns a stable,
 * non-expiring URL safe to persist and use directly in <img src>.
 */
import { API_BASE_URL } from '@/utils/constants';

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

export async function uploadMedia(file: File, folder = 'general'): Promise<UploadedMedia> {
  const form = new FormData();
  form.append('file', file);
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
