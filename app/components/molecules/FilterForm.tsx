"use client";

import React, { useState, useEffect } from "react";
import Form from "./Form";
import Input from "../atoms/Input";
import Select from "../atoms/Select";
import Button from "../atoms/Button";

interface FilterFormProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onFilter: (filters: any) => void;
}

// Sample services data (this would be fetched or passed as props in a real case)
const servicesData = [
    { category: "Accommodation", subcategory: "Luxury Hotels" },
    { category: "Accommodation", subcategory: "Budget Hotels" },
    { category: "Adventure Sports", subcategory: "Trekking and Hiking" },
    { category: "Adventure Sports", subcategory: "Paragliding" },
    { category: "Food and Beverages", subcategory: "Local Cuisine" },
    // Add other services data here
];

const FilterForm: React.FC<FilterFormProps> = ({ onFilter }) => {
    const [filters, setFilters] = useState({
        name: "",
        category: "All",
        subcategory: "All",
        priceRange: [0, 1000],
    });

    const [subcategoryOptions, setSubcategoryOptions] = useState<string[]>(["All"]);



    useEffect(() => {
        // Update subcategory options based on the selected category
        const filteredSubcategories = [
            ...new Set(
                servicesData
                    .filter((service) => service.category === filters.category || filters.category === "All")
                    .map((service) => service.subcategory)
            ),
        ];
        setSubcategoryOptions(["All", ...filteredSubcategories]);
    }, [filters.category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter(filters);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <Input
                    label="Service Name"
                    name="name"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    placeholder="Enter service name"
                />

                <Select
                    label="Category"
                    name="category"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    options={["All", "Accommodation", "Transportation", "Tours and Activities", "Food and Beverages", "Handicrafts and Shopping", "Event Services", "Wellness and Health", "Water-based Activities"]}
                />

                <Select
                    label="Subcategory"
                    name="subcategory"
                    value={filters.subcategory}
                    onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                    options={subcategoryOptions}
                />

                <div className="flex items-center gap-4">
                    <label className="text-sm">Price Range</label>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        value={filters.priceRange[1]}
                        onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], Number(e.target.value)] })}
                        className="w-full"
                    />
                    <span className="text-sm">${filters.priceRange[0]} - ${filters.priceRange[1]}</span>
                </div>

                <Button type="submit" variant="primary" size="large" className="w-full">
                    Apply Filters
                </Button>
            </div>
        </Form>
    );
};

export default FilterForm;
