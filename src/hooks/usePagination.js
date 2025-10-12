'use client';
import { useState, useMemo } from 'react';

export const usePagination = (data, itemsPerPage = 8) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination info
  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const currentData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Smooth scroll to top of content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset to first page when data changes
  const resetPagination = () => {
    setCurrentPage(1);
  };

  // Go to specific page
  const goToPage = (page) => {
    handlePageChange(page);
  };

  // Navigation helpers
  const goToFirstPage = () => handlePageChange(1);
  const goToLastPage = () => handlePageChange(totalPages);
  const goToNextPage = () => handlePageChange(currentPage + 1);
  const goToPreviousPage = () => handlePageChange(currentPage - 1);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    currentData,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    handlePageChange,
    resetPagination,
    goToPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage
  };
};