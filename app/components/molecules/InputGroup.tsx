"use client";

import React from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";

interface InputGroupProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSend: () => void;
    placeholder?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ value, onChange, onSend, placeholder }) => (
    <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-white shadow-sm">
        <Input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="flex-grow border-none focus:ring-0" name=""
        />
        <Button onClick={onSend} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
            Send
        </Button>
    </div>
);

export default InputGroup;
