import React, { useState, useRef, useEffect } from 'react';

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
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const roleOptions = [
        { value: 'all', label: 'Todos os Cargos' },
        { value: 'Desenvolvedor', label: 'Desenvolvedor' },
        { value: 'Editor-Chefe', label: 'Editor-Chefe' },
        { value: 'Editor', label: 'Editor' },
        { value: 'Repórter', label: 'Repórter' },
        { value: 'Anunciante', label: 'Anunciante' },
        { value: 'Leitor', label: 'Leitor' },
        { value: 'Candidato', label: 'Candidato' },
    ];

    const currentLabel = roleOptions.find(opt => opt.value === roleFilter)?.label || 'Selecione';

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

            {/* Custom Premium Dropdown */}
            <div className="w-full md:w-auto relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full md:w-[200px] flex items-center justify-between border rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider outline-none transition-all ${darkMode
                        ? `bg-black/40 border-white/10 text-gray-300 hover:border-white/20 ${isOpen ? 'border-red-600 ring-1 ring-red-600/50' : ''}`
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                >
                    <span className="truncate mr-2">{currentLabel}</span>
                    <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-red-500' : 'text-gray-500'}`}></i>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className={`absolute top-full right-0 mt-2 w-full md:w-[220px] rounded-xl border shadow-xl overflow-hidden z-[100] animate-fadeIn ${darkMode
                        ? 'bg-[#151515] border-white/10'
                        : 'bg-white border-gray-100'
                        }`}>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                            {roleOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onRoleFilterChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between group ${roleFilter === option.value
                                        ? (darkMode ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-black text-white')
                                        : (darkMode ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-black')
                                        }`}
                                >
                                    {option.label}
                                    {roleFilter === option.value && (
                                        <i className="fas fa-check"></i>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserFilterBar;
