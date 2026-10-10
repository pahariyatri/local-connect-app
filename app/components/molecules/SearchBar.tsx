import React, { useState } from "react";
import Button from "../atoms/Button";

type SearchBarProps = {
    onSearch: (query: {
        search: string;
        startDate: string | null;
        endDate: string | null;
    }) => void;
    suggestions: string[];
};

export default function SearchBar({ onSearch, suggestions }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [startDate] = useState<string | null>(null);
    const [endDate] = useState<string | null>(null);
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

    const handleSearch = () => onSearch({ search: query, startDate, endDate });

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 0) {
            setFilteredSuggestions(
                suggestions.filter((suggestion) =>
                    suggestion.toLowerCase().includes(value.toLowerCase())
                )
            );
        } else {
            setFilteredSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        setFilteredSuggestions([]);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-2 p-2 bg-white rounded-2xl md:rounded-full shadow-2xl border border-slate-100 w-full group transition-all duration-300 focus-within:ring-4 focus-within:ring-emerald-500/10">
            <div className="w-full relative flex items-center pl-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input
                    type="text"
                    value={query}
                    placeholder="Where are you going?"
                    onChange={handleQueryChange}
                    className="w-full py-4 px-3 bg-transparent border-none focus:outline-none text-slate-700 font-medium placeholder:text-slate-400"
                />
                
                {filteredSuggestions.length > 0 && (
                    <div className="absolute left-0 top-full mt-4 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full px-6 py-4 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                            >
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                </div>
                                <span className="font-semibold text-slate-700">{suggestion}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="hidden md:block w-px h-10 bg-slate-100 mx-2"></div>
            
            <div className="w-full md:w-auto p-1">
                <Button
                    onClick={handleSearch}
                    size="large"
                    className="w-full md:w-auto rounded-xl md:rounded-full py-3 md:py-4 px-10"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>}
                >
                    Search
                </Button>
            </div>
        </div>
    );
}
