import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);
    
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className={`flex flex-col items-center space-y-4 mt-6 pb-4 ${className}`}>
      <p className="text-sm text-indigo-600 font-medium">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex justify-center items-center space-x-2 bg-indigo-50 px-4 py-3 rounded-lg shadow-sm border border-indigo-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-100"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        {getPageNumbers().map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={currentPage === pageNumber ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(pageNumber)}
            className={
              currentPage === pageNumber
                ? "bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                : "border-indigo-200 text-indigo-600 hover:bg-indigo-100"
            }
            aria-label={`Page ${pageNumber}`}
            aria-current={currentPage === pageNumber ? "page" : undefined}
          >
            {pageNumber}
          </Button>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-100"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
