"use client";

import React from "react";

type CheckboxProps = {
    label: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Checkbox({ label, name, checked, onChange }: CheckboxProps) {
    return (
        <div className="flex items-center">
            <input
                id={name}
                name={name}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500"
            />
            <label htmlFor={name} className="ml-2 text-sm font-medium text-slate-700">
                {label}
            </label>
        </div>
    );
}
