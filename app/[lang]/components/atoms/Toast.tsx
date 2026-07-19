"use client";

import React from "react";
import { useNotification } from "@/contexts/NotificationContext";

export const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => {
  const getIcon = () => {
    switch (type) {
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success": return "border-emerald-500/50 bg-emerald-50 text-emerald-900";
      case "error": return "border-red-500/50 bg-red-50 text-red-900";
      case "warning": return "border-amber-500/50 bg-amber-50 text-amber-900";
      default: return "border-emerald-500/50 bg-emerald-50 text-slate-900";
    }
  };

  return (
    <div className={`glass p-4 rounded-2xl border-2 ${getColor()} shadow-2xl flex items-center gap-4 animate-slide-up min-w-[300px] pointer-events-auto`}>
      <div className="text-xl">{getIcon()}</div>
      <p className="flex-1 font-bold text-sm leading-tight">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  );
};

export const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-6">
      {notifications.map((n) => (
        <Toast 
            key={n.id} 
            message={n.message} 
            type={n.type} 
            onClose={() => removeNotification(n.id)} 
        />
      ))}
    </div>
  );
};
