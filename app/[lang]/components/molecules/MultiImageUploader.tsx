"use client";

import React, { useRef, useState } from "react";
import { uploadMedia, validateImage } from "@/services/mediaService";

interface MultiImageUploaderProps {
  /** Current image URLs. */
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  max?: number;
  label?: string;
  className?: string;
}

/**
 * Grid of uploaded images + an "add" tile. Uploads each selected file to
 * object storage via the media API and stores the returned stable URLs.
 */
export default function MultiImageUploader({
  value,
  onChange,
  folder = "gallery",
  max = 8,
  label = "Add images",
  className = "",
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0); // count of in-flight uploads
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, max - value.length);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setError(null);

    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(`You can add up to ${max} images.`);
    }

    for (const file of toUpload) {
      const validationError = validateImage(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      setUploading((n) => n + 1);
      try {
        const { url } = await uploadMedia(file, folder);
        // Read latest via callback form to avoid stale closures across awaits.
        onChange([...(latestRef.current ?? value), url]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  // Track the newest value so concurrent uploads append correctly.
  const latestRef = useRef<string[]>(value);
  latestRef.current = value;

  const removeAt = (idx: number) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((url, idx) => (
          <div key={url + idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Uploaded ${idx + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              aria-label={`Remove image ${idx + 1}`}
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={label}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
          >
            {uploading > 0 ? (
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                <span className="text-[10px] font-semibold uppercase tracking-wide">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleFiles}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
