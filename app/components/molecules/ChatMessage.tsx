"use client";

import React from "react";

interface ChatMessageProps {
    message: string;
    isUser?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser = false }) => (
    <div
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
        <div
            className={`max-w-xs px-4 py-2 rounded-lg ${isUser
                    ? "bg-blue-600 text-white"
                    : "bg-slate-300 text-black"
                } shadow-md`}
        >
            {message}
        </div>
    </div>
);

export default ChatMessage;
