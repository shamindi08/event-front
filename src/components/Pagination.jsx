'use client';
import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showInfo = true,
  size = 'medium' // 'small', 'medium', 'large'
}) {
  if (totalPages <= 1) return null;

  const sizeClasses = {
    small: {
      button: 'w-8 h-8 text-sm',
      container: 'gap-1',
      text: 'text-sm'
    },
    medium: {
      button: 'w-10 h-10 text-base',
      container: 'gap-2',
      text: 'text-base'
    },
    large: {
      button: 'w-12 h-12 text-lg',
      container: 'gap-3',
      text: 'text-lg'
    }
  };

  const styles = sizeClasses[size];

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const PageButton = ({ page, isActive = false, disabled = false, children, onClick }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} flex items-center justify-center rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
          : disabled
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-800 hover:scale-105 shadow-sm hover:shadow-md'
      }`}
    >
      {children}
    </button>
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-6">
      {/* Items Info */}
      {showInfo && (
        <div className={`${styles.text} text-slate-600 order-2 sm:order-1`}>
          Showing <span className="font-semibold text-slate-800">{startItem}</span> to{' '}
          <span className="font-semibold text-slate-800">{endItem}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalItems}</span> results
        </div>
      )}

      {/* Pagination Controls */}
      <div className={`flex items-center ${styles.container} order-1 sm:order-2`}>
        {/* First Page */}
        <PageButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          <MdFirstPage className="w-5 h-5" />
        </PageButton>

        {/* Previous Page */}
        <PageButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <MdChevronLeft className="w-5 h-5" />
        </PageButton>

        {/* Page Numbers */}
        {visiblePages.map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-slate-400">
              ...
            </span>
          ) : (
            <PageButton
              key={page}
              isActive={page === currentPage}
              onClick={() => onPageChange(page)}
            >
              {page}
            </PageButton>
          )
        ))}

        {/* Next Page */}
        <PageButton
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <MdChevronRight className="w-5 h-5" />
        </PageButton>

        {/* Last Page */}
        <PageButton
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <MdLastPage className="w-5 h-5" />
        </PageButton>
      </div>
    </div>
  );
}