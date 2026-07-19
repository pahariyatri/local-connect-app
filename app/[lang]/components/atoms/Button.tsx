"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export default function Button({
  type = "button",
  variant = "primary",
  size = "medium",
  icon,
  iconRight,
  onClick,
  disabled = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClass = "btn-premium";
  
  const variants = {
    primary: "btn-primary",
    brand: "btn-brand",
    secondary: "btn-secondary",
    outline: "border-2 border-slate-900 text-slate-900 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 shadow-none",
  };

  const sizes = {
    small: "px-4 py-1.5 text-sm",
    medium: "px-6 py-2.5 text-base",
    large: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:scale-100 disabled:shadow-none`}
      aria-disabled={disabled}
      {...props}
    >
      {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
      {children}
      {iconRight && <span className="transition-transform group-hover:translate-x-1">{iconRight}</span>}
    </button>
  );
}
