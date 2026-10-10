import React from "react";

/**
 * Error message for form controls that aren't a plain <input>/<textarea> —
 * button groups (category pickers, capacity steppers) can't use Input's
 * built-in `error` prop since there's no single field to attach it to.
 * Same placement/styling convention as Input/Textarea: directly below the
 * control, never a shared bottom-of-page or fixed-position banner.
 */
export default function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs text-red-500 mt-1.5 pl-2 animate-fade-in">
      {message}
    </p>
  );
}
