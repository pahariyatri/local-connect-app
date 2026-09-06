"use client";

import React, { useRef, useState, useCallback } from "react";
import {
  uploadMediaWithProgress,
  deleteMedia,
  getMediaKeyFromUrl,
  validateImage,
  validateImageDimensions,
  type UploadedMedia,
} from "@/services/mediaService";

export interface MediaItem extends UploadedMedia {}

interface InFlightUpload {
  id: string;
  name: string;
  progress: number;
  error: string | null;
}

interface MediaManagerProps {
  /** Ordered media list — index 0 is always the cover/thumbnail. */
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  /** Storage folder, e.g. "service-images". */
  folder?: string;
  max?: number;
  minWidth?: number;
  minHeight?: number;
  label?: string;
  className?: string;
}

/**
 * Reusable gallery manager for Service Create/Edit — upload (with per-file
 * progress, type/size/dimension validation, drag & drop, duplicate
 * prevention), reorder, cover selection, and confirm-before-remove, all
 * against the real /media API. Shared by both the onboarding and edit
 * flows so they can't drift.
 */
export default function MediaManager({
  value,
  onChange,
  folder = "service-images",
  max = 8,
  minWidth,
  minHeight,
  label = "Listing photos",
  className = "",
}: MediaManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<InFlightUpload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState<number | null>(null);

  // Snapshot of URLs present on mount — anything not in this set was added
  // this session, so it can be badged "New" vs. pre-existing.
  const existingUrlsRef = useRef<Set<string>>(new Set(value.map((v) => v.url)));
  // Dedupe guard: file signatures already uploaded (or in flight) this
  // session, so re-selecting the same file doesn't create a second copy.
  const seenSignaturesRef = useRef<Set<string>>(new Set());
  const latestValueRef = useRef<MediaItem[]>(value);
  latestValueRef.current = value;

  const remaining = Math.max(0, max - value.length - uploads.length);

  const fileSignature = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;

  const uploadOne = useCallback(
    async (file: File) => {
      const id = `${fileSignature(file)}-${Math.random().toString(36).slice(2)}`;
      setUploads((prev) => [...prev, { id, name: file.name, progress: 0, error: null }]);

      try {
        const dimError = minWidth || minHeight
          ? await validateImageDimensions(file, minWidth, minHeight)
          : null;
        if (dimError) throw new Error(dimError);

        const result = await uploadMediaWithProgress(file, folder, (percent) => {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: percent } : u)));
        });

        onChange([...latestValueRef.current, result]);
        setUploads((prev) => prev.filter((u) => u.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, error: message } : u)));
        seenSignaturesRef.current.delete(fileSignature(file)); // allow retry via re-select
      }
    },
    [folder, minWidth, minHeight, onChange],
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!files.length) return;
      setError(null);

      const toUpload: File[] = [];
      for (const file of files) {
        if (toUpload.length >= remaining) {
          setError(`You can add up to ${max} photos.`);
          break;
        }
        const sig = fileSignature(file);
        if (seenSignaturesRef.current.has(sig)) {
          continue; // already uploaded or in flight this session
        }
        const validationError = validateImage(file);
        if (validationError) {
          setError(validationError);
          continue;
        }
        seenSignaturesRef.current.add(sig);
        toUpload.push(file);
      }

      // Sequential, not Promise.all — completion order must match selection
      // order so "first photo selected becomes the cover" holds true. Each
      // file still gets its own progress tile immediately (inside
      // uploadOne), so the UI doesn't look serial even though the network
      // requests are.
      void (async () => {
        for (const file of toUpload) {
          await uploadOne(file);
        }
      })();
    },
    [max, remaining, uploadOne],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const setCover = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  };

  const confirmRemove = (index: number) => {
    const item = value[index];
    const key = item.key || getMediaKeyFromUrl(item.url);
    if (key) {
      deleteMedia(key).catch((err) => console.error("Failed to delete media from storage:", err));
    }
    onChange(value.filter((_, i) => i !== index));
    setConfirmingRemove(null);
  };

  const dismissUploadError = (id: string) => setUploads((prev) => prev.filter((u) => u.id !== id));

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-slate-700 mb-2">{label}</p>}

      {value.length === 0 && uploads.length === 0 && (
        <p className="text-xs text-slate-400 mb-3">No photos yet — the first one you add becomes the cover photo.</p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((item, idx) => {
          const isCover = idx === 0;
          const isNew = !existingUrlsRef.current.has(item.url);
          const isConfirming = confirmingRemove === idx;
          return (
            <div key={item.url + idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />

              {isCover && (
                <span className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md shadow-sm">
                  Cover
                </span>
              )}
              {isNew && !isCover && (
                <span className="absolute top-1 left-1 bg-slate-900/80 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md shadow-sm">
                  New
                </span>
              )}

              {isConfirming ? (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-white text-[11px] font-semibold text-center">Remove this photo?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => confirmRemove(idx)}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingRemove(null)}
                      className="px-2.5 py-1 rounded-lg bg-white text-slate-900 text-[11px] font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setConfirmingRemove(idx)}
                    aria-label={`Remove photo ${idx + 1}`}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>

                  <div className="absolute bottom-1 inset-x-1 flex items-center justify-between gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <div className="flex gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveItem(idx, -1)}
                        disabled={idx === 0}
                        aria-label="Move earlier"
                        className="h-6 w-6 rounded-md bg-black/60 text-white text-xs flex items-center justify-center disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(idx, 1)}
                        disabled={idx === value.length - 1}
                        aria-label="Move later"
                        className="h-6 w-6 rounded-md bg-black/60 text-white text-xs flex items-center justify-center disabled:opacity-30"
                      >
                        →
                      </button>
                    </div>
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => setCover(idx)}
                        className="px-1.5 h-6 rounded-md bg-black/60 text-white text-[9px] font-bold uppercase"
                      >
                        Set cover
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {uploads.map((u) => (
          <div key={u.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-2">
            {u.error ? (
              <>
                <p className="text-[10px] text-red-500 text-center font-medium mb-1">{u.error}</p>
                <button type="button" onClick={() => dismissUploadError(u.id)} className="text-[10px] font-bold text-slate-500 underline">
                  Dismiss
                </button>
              </>
            ) : (
              <>
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500 mb-2" />
                <span className="text-[10px] font-semibold text-slate-500">{u.progress}%</span>
              </>
            )}
          </div>
        ))}

        {remaining > 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors ${
              isDraggingOver ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-300 text-slate-400"
            }`}
          >
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              aria-label="Add photos"
              className="flex flex-col items-center justify-center gap-1 h-full w-full hover:text-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-center px-1">
                Add or drop photos
              </span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
