import { useCallback, useState } from "react";

/**
 * Shared "touched" state for multi-step forms (vendor onboarding, add-service
 * wizard, …). A field's error only renders once it's touched, so validation
 * messages appear one at a time as the user actually interacts with a field
 * instead of all at once on mount.
 *
 * markAllTouched exists for the "Continue" tap: it reveals every error on the
 * current step in one go for whichever fields the user skipped entirely
 * (blur-only marking can't catch a field the user never focused, and a
 * button-group "field" like a category picker has no blur event at all).
 */
export function useTouchedFields<T extends string>() {
  const [touched, setTouched] = useState<Partial<Record<T, boolean>>>({});

  const markTouched = useCallback((field: T) => {
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  }, []);

  const markAllTouched = useCallback((fields: readonly T[]) => {
    setTouched((t) => {
      let changed = false;
      const next = { ...t };
      for (const f of fields) {
        if (!next[f]) {
          next[f] = true;
          changed = true;
        }
      }
      return changed ? next : t;
    });
  }, []);

  return { touched, markTouched, markAllTouched } as const;
}
