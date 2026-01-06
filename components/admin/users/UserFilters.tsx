
import React from 'react';
import { USER_ROLES } from './constants';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleFilterChange: (val: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({ searchTerm, onSearchChange, roleFilter, onRoleFilterChange }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-8">
        <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 pointer-events-none">
                <i className="fas fa-search text-xs"></i>
            </div>
            <input 
                type="text" 
                placeholder="Buscar por nome ou e-mail..." 
                value={searchTerm} 
                onChange={(e) => onSearchChange(e.target.value)} 
                className="w-full h-14 pl-14 pr-4 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-sm text-gray-800 placeholder:text-gray-300 focus:border-red-200 focus:ring-4 focus:ring-red-50 transition-all shadow-sm" 
            />
        </div>
        <div className="relative md:w-64">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 pointer-events-none">
                <i className="fas fa-filter text-xs"></i>
            </div>
            <select 
                value={roleFilter} 
                onChange={(e) => onRoleFilterChange(e.target.value)} 
                className="w-full h-14 pl-14 pr-10 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-xs uppercase text-gray-600 focus:border-red-200 focus:ring-4 focus:ring-red-50 transition-all shadow-sm appearance-none"
            >
                <option value="all">Todos os Cargos</option>
                {USER_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
            <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none"></i>
        </div>
    </div>
  );
};

export default UserFilters;
