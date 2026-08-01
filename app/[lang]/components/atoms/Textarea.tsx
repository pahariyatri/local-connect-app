import React from "react";

interface TextareaProps {
    label?: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    className?: string;
    rows?: number;
    error?: string;
    hint?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, value, onChange, onBlur, placeholder, className, rows = 4, error, hint }) => {
    const errorId = error ? `${name}-error` : undefined;
    const hintId = !error && hint ? `${name}-hint` : undefined;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={name} className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">
                    {label}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                rows={rows}
                aria-invalid={!!error}
                aria-describedby={errorId || hintId}
                className={`w-full border-2 rounded-2xl px-5 py-4 text-slate-900 bg-slate-50/50 focus:outline-none focus:bg-white transition-all placeholder-slate-300 font-medium resize-none ${
                    error ? "border-red-300 focus:border-red-400" : "border-slate-100/50 focus:border-slate-900"
                } ${className || ""}`}
            />
            {error ? (
                <p id={errorId} role="alert" className="text-xs text-red-500 mt-1.5 pl-2">{error}</p>
            ) : hint ? (
                <p id={hintId} className="text-xs text-slate-400 mt-1.5 pl-2">{hint}</p>
            ) : null}
        </div>
    );
};

export default Textarea;
