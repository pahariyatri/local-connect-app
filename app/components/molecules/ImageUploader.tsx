"use client";

import React, { useRef, useState, useEffect } from "react";
import { uploadMedia, validateImage, deleteMedia, getMediaKeyFromUrl } from "@/services/mediaService";

interface ImageUploaderProps {
  /** Current image URL (stable backend/media URL). */
  value?: string;
  /** Called with the stored URL + key once upload succeeds. */
  onChange: (url: string, key: string) => void;
  /** Storage folder, e.g. "avatars", "services". */
  folder?: string;
  shape?: "circle" | "square";
  /** Tailwind size utilities for the frame, e.g. "h-32 w-32". */
  sizeClassName?: string;
  /** Accessible label / helper text. */
  label?: string;
  className?: string;
}

/**
 * Reusable image picker → uploads to object storage via the media API and
 * returns a stable URL. Shows an instant local preview, an uploading state,
 * and inline errors. Keyboard + screen-reader accessible.
 */
export default function ImageUploader({
  value,
  onChange,
  folder = "general",
  shape = "circle",
  sizeClassName = "h-28 w-28",
  label = "Upload image",
  className = "",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Keep preview in sync if the parent value changes (e.g. after data load).
  useEffect(() => {
    if (!uploading) setPreview(value);
  }, [value, uploading]);

  // Revoke any outstanding object URL on unmount.
  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const rounded = shape === "circle" ? "rounded-full" : "rounded-2xl";

  const openPicker = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);

    // Instant optimistic preview.
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setPreview(localUrl);
    setUploading(true);

    const oldKey = value ? getMediaKeyFromUrl(value) : null;

    try {
      const { url, key } = await uploadMedia(file, folder);
      onChange(url, key);
      setPreview(url); // swap blob → stable URL

      // Delete the old file from S3 if replacement was successful and key changed
      if (oldKey && oldKey !== key) {
        deleteMedia(oldKey).catch((err) =>
          console.error("Failed to delete old image from S3:", err)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(value); // revert to previous
    } finally {
      setUploading(false);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }
  };


  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={openPicker}
        aria-label={label}
        aria-busy={uploading}
        className={`group relative ${sizeClassName} ${rounded} overflow-hidden border-2 border-slate-200 bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-colors hover:border-emerald-400`}
      >
        {preview ? (
          // Native img handles blob: previews and arbitrary hosts uniformly.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-slate-400">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </span>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </span>
        )}

        {/* Edit affordance */}
        {!uploading && (
          <span className="absolute bottom-0 right-0 m-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md transition-transform group-hover:scale-110">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && <p className="text-xs font-medium text-red-500 max-w-[12rem] text-center">{error}</p>}
    </div>
  );
}
