import React from 'react';
import {
  Pagination as UIPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CustomPagination({ page, totalPages, onPageChange }: CustomPaginationProps) {
  
  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  // Lógica para renderizar os números de página (ex: 1 ... 4 5 6 ... 10)
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (page > 3) {
        pageNumbers.push('...');
      }

      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(totalPages - 1, page + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (page < totalPages - 2) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <UIPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => { e.preventDefault(); handlePrevious(); }} 
            className={page === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {renderPageNumbers().map((p, index) => (
          <PaginationItem key={`${p}-${index}`}>
            {p === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink 
                href="#" 
                isActive={page === p} 
                onClick={(e) => { e.preventDefault(); onPageChange(p as number); }}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNext(); }} 
            className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </UIPagination>
  );
} 