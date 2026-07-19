import React from "react";

interface TextareaProps {
    label?: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    className?: string;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, value, onChange, placeholder, className }) => {
    return (
        <div className="flex flex-col space-y-1">
            {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            />
        </div>
    );
};

export default Textarea;
