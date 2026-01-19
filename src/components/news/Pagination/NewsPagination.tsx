import React from 'react';

interface NewsPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const NewsPagination: React.FC<NewsPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-12 mb-8 animate-fadeIn">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:hover:border-gray-200 active:scale-95"
                aria-label="Página anterior"
            >
                <i className="fas fa-chevron-left text-xs"></i>
            </button>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1 max-w-[280px] md:max-w-none">
                {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`
                                w-10 h-10 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center justify-center transition-all shrink-0
                                ${isActive
                                    ? 'bg-black text-white shadow-lg scale-110'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-500'
                                }
                            `}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:hover:border-gray-200 active:scale-95"
                aria-label="Próxima página"
            >
                <i className="fas fa-chevron-right text-xs"></i>
            </button>
        </div>
    );
};

export default NewsPagination;
