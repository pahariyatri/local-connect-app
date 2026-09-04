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

/**
 * Recovers the R2 object key from a URL previously returned by
 * uploadMedia()/getServiceById() etc. Those are presigned URLs shaped
 * `https://<endpoint>/<bucket>/<key...>?X-Amz-...` (path-style) — the key
 * is everything in the pathname after the bucket segment, and stays
 * recoverable even after the signature itself has expired (expiry only
 * affects whether R2 will actually serve the object, not the URL's
 * structure). Mirrors backend MediaService.extractKeyFromUrl — keep both
 * in sync if the storage URL shape ever changes.
 */
export function getMediaKeyFromUrl(url: string): string | null {
  if (!url) return null;
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null; // need at least <bucket>/<key>
    return segments.slice(1).join('/');
  } catch {
    return null;
  }
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

export const MIN_IMAGE_WIDTH = 480;
export const MIN_IMAGE_HEIGHT = 320;

/**
 * Rejects images too small to look good as a listing photo. Runs after
 * validateImage() (type/size) since there's no point measuring a file
 * that's already going to be rejected.
 */
export function validateImageDimensions(
  file: File,
  minWidth = MIN_IMAGE_WIDTH,
  minHeight = MIN_IMAGE_HEIGHT,
): Promise<string | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < minWidth || img.height < minHeight) {
        resolve(`Image is too small (min ${minWidth}×${minHeight}px, this is ${img.width}×${img.height}px).`);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('Could not read this image — it may be corrupted.');
    };
    img.src = objectUrl;
  });
}

/**
 * Same upload as uploadMedia() but over XMLHttpRequest so callers can show
 * real byte-progress — fetch() has no upload-progress event. Kept as a
 * separate function rather than changing uploadMedia()'s signature, since
 * most callers don't need progress and XHR's callback-style API is worse
 * to read than the plain async/await version.
 */
export function uploadMediaWithProgress(
  file: File,
  folder = 'general',
  onProgress?: (percent: number) => void,
): Promise<UploadedMedia> {
  return new Promise((resolve, reject) => {
    processImageBeforeUpload(file).then((processedFile) => {
      const form = new FormData();
      form.append('file', processedFile);
      form.append('folder', folder);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/media/upload`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(`Upload failed (${xhr.status})`));
          return;
        }
        try {
          const json = JSON.parse(xhr.responseText);
          const data = json?.data ?? json;
          if (!data?.url || !data?.key) {
            reject(new Error('Upload response missing url/key'));
            return;
          }
          onProgress?.(100);
          resolve({ key: data.key, url: data.url });
        } catch {
          reject(new Error('Upload response was not valid JSON'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed — network error'));
      xhr.send(form);
    }, reject);
  });
}

export async function deleteMedia(key: string): Promise<void> {
  // Keys are folder-prefixed ("service-images/169...-file.webp"). The
  // backend route is a single :key path segment, so the "/" must be
  // percent-encoded here or Express 404s trying to match it as an extra
  // path segment — Nest decodes %2F back to "/" when populating the param.
  const res = await fetch(`${API_BASE_URL}/media/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Delete failed (${res.status})`);
  }
}

