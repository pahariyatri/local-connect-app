"use client";

import React from "react";

export type BudgetStyle = "budget" | "comfort" | "premium";

interface BudgetOption {
  id: BudgetStyle;
  label: string;
  icon: string;
  priceRange: string;
  description: string;
}

interface BudgetStyleSelectorProps {
  selectedBudget: BudgetStyle | null;
  onBudgetChange: (budget: BudgetStyle) => void;
}

const BUDGET_STYLES: BudgetOption[] = [
  {
    id: "budget",
    label: "Budget",
    icon: "₹",
    priceRange: "₹5K - ₹15K",
    description: "Best value stays & local transport",
  },
  {
    id: "comfort",
    label: "Comfort",
    icon: "₹₹",
    priceRange: "₹15K - ₹35K",
    description: "3-star hotels & private cabs",
  },
  {
    id: "premium",
    label: "Premium",
    icon: "₹₹₹",
    priceRange: "₹35K+",
    description: "Luxury resorts & premium experiences",
  },
];

export default function BudgetStyleSelector({
  selectedBudget,
  onBudgetChange,
}: BudgetStyleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          Budget Style
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Choose your comfort level
        </p>
      </div>

      <div className="space-y-3">
        {BUDGET_STYLES.map((option) => {
          const isSelected = selectedBudget === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onBudgetChange(option.id)}
              className={`
                w-full p-5 rounded-2xl transition-all duration-300 text-left
                ${isSelected
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-200 scale-[0.98]"
                  : "bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-slate-900"
                }
                active:scale-95
              `}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black
                  ${isSelected ? "bg-white/20 text-white" : "bg-slate-50 text-indigo-600"}
                `}>
                  {option.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-base font-black uppercase tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                      {option.label}
                    </h4>
                    <span className={`text-xs font-bold ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                      {option.priceRange}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                    {option.description}
                  </p>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg animate-scale-in">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
