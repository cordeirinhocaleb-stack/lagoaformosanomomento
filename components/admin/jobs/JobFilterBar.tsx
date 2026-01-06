import React from 'react';

interface JobFilterBarProps {
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
}

const JobFilterBar: React.FC<JobFilterBarProps> = ({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Buscar vagas por título, empresa ou local..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-red-500 transition-colors text-sm"
                />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                {['all', 'active', 'inactive'].map((status) => (
                    <button
                        key={status}
                        onClick={() => onStatusFilterChange(status)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${statusFilter === status
                            ? 'bg-red-600 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        {status === 'all' ? 'Todas' : status === 'active' ? 'Ativas' : 'Inativas'}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default JobFilterBar;
