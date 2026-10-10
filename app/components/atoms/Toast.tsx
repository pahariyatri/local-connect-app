"use client";

import React from "react";
import { useNotification } from "@/contexts/NotificationContext";

export const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>;
      case "error":
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m9.5 9.5 5 5m0-5-5 5" /></svg>;
      case "warning":
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.5 2.5 20h19L12 3.5Z" /><path d="M12 10v4" /><path d="M12 17h.01" /></svg>;
      default:
        return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></svg>;
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
    <div className={`glass p-4 rounded-2xl border-2 ${getColor()} shadow-2xl flex items-center gap-4 animate-slide-up min-w-[300px] pointer-events-auto`} role="alert">
      <div className="w-5 h-5 flex-shrink-0" aria-hidden="true">{getIcon()}</div>
      <p className="flex-1 font-bold text-sm leading-tight">{message}</p>
      <button onClick={onClose} aria-label="Dismiss" className="p-1 hover:bg-black/5 rounded-lg text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-current">
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
