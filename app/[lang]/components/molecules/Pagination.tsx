"use client";

import React from "react";
import Button from "../atoms/Button";

type PaginationProps = {
    totalItems: number;
    itemsPerPage: number;
    currentPage?: number;
    onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({ totalItems, itemsPerPage, currentPage = 1, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    let startPage = currentPage;
    let endPage = currentPage + 1;

    if (endPage > totalPages) {
        startPage = totalPages - 1;
        endPage = totalPages;
    }

    if (startPage < 1) {
        startPage = 1;
        endPage = 2;
    }

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="flex justify-center mt-8 space-x-2">
            <Button variant="secondary" size="small" onClick={handlePrev} disabled={currentPage === 1}>
                Prev
            </Button>

            <div className="flex items-center space-x-2">
                {[startPage, endPage].map((page) => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="small"
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </Button>
                ))}
            </div>

            <Button variant="secondary" size="small" onClick={handleNext} disabled={currentPage === totalPages}>
                Next
            </Button>
        </div>
    );
};

export default Pagination;
