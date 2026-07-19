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
  ...rest
}: InputProps) {
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
        className={`w-full border-2 border-slate-100/50 rounded-2xl px-5 py-4 text-slate-900 bg-slate-50/50 focus:outline-none focus:bg-white focus:border-slate-900 transition-all placeholder-slate-300 font-medium ${className}`}
        {...rest}
      />
    </div>
  );
}
