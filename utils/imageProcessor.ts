/**
 * Client-side image processor for resizing and compressing images before upload.
 * Improves upload speed, reduces bandwidth and S3 storage space, and maintains visual quality.
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Resizes and compresses an image file using browser Canvas.
 * Safely handles Next.js SSR by checking for the window object.
 */
export async function processImageBeforeUpload(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  // Safe-guard for server-side execution (SSR)
  if (typeof window === 'undefined') {
    return file;
  }

  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
  } = options;

  // Only process images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Skip animated GIFs to avoid breaking their animation frames
  if (file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Only resize if the image exceeds the maximum dimensions
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      } else if (file.size <= 200 * 1024) {
        // If the file is already small (e.g. < 200KB) and dimensions are within bounds, skip processing
        resolve(file);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw image to canvas with the new dimensions
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output mime type. WebP is highly recommended for web as it supports transparency
      // and has far better compression ratio than JPEG/PNG.
      const outputMimeType = 'image/webp';
      const outputExtension = '.webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // Generate a clean filename with the correct extension
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const newFileName = `${baseName}${outputExtension}`;

          const processedFile = new File([blob], newFileName, {
            type: outputMimeType,
            lastModified: Date.now(),
          });

          // Return the smaller of the two files (safety check in case compression made it larger)
          if (processedFile.size < file.size) {
            resolve(processedFile);
          } else {
            resolve(file);
          }
        },
        outputMimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
  });
}
