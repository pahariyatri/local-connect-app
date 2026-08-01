import React from "react";

type InputProps = {
  label?: string;
  name: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "file" | "password";
  value?: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  autoFocus?: boolean;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "tel" | "decimal" | "email" | "search" | "url" | "none";
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Shown below the field in red, and switches the border to red. Pass only after the field has been touched/submitted. */
  error?: string;
  hint?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name" | "type" | "value" | "onChange" | "className" | "inputMode"
>;

export default function Input({
  label,
  name,
  type = "text",
  value,
  placeholder = "",
  onChange,
  className = "",
  autoFocus = false,
  maxLength,
  inputMode,
  onKeyDown,
  error,
  hint,
  ...rest
}: InputProps) {
  const errorId = error ? `${name}-error` : undefined;
  const hintId = !error && hint ? `${name}-hint` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={errorId || hintId}
        className={`w-full border-2 rounded-2xl px-5 py-4 text-slate-900 bg-slate-50/50 focus:outline-none focus:bg-white transition-all placeholder-slate-300 font-medium ${
          error ? "border-red-300 focus:border-red-400" : "border-slate-100/50 focus:border-slate-900"
        } ${className}`}
        {...rest}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1.5 pl-2">{error}</p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-slate-400 mt-1.5 pl-2">{hint}</p>
      ) : null}
    </div>
  );
}
