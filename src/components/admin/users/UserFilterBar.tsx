import React from 'react';

interface UserFilterBarProps {
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    roleFilter: string;
    onRoleFilterChange: (role: string) => void;
    darkMode?: boolean;
}

const UserFilterBar: React.FC<UserFilterBarProps> = ({
    searchTerm,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    darkMode = true
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={onSearchChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-medium outline-none transition-colors ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-red-600' : 'bg-white border-gray-200 text-gray-700 focus:border-black'}`}
                />
            </div>

            <div className="flex gap-2 relative overflow-x-auto pb-1 md:pb-0">
                {['all', 'admin', 'user', 'advertiser', 'candidate'].map((role) => (
                    <button
                        key={role}
                        onClick={() => onRoleFilterChange(role)}
                        className={`
                            px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border
                            ${roleFilter === role
                                ? (darkMode ? 'bg-red-600 text-white border-red-600 shadow-lg' : 'bg-black text-white border-black')
                                : (darkMode ? 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300')
                            }
                        `}
                    >
                        {role === 'all' ? 'Todos' : role}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default UserFilterBar;
