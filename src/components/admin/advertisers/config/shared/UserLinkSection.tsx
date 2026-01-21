
import React, { useState } from 'react';
import { getUserByDocument, getUserByName } from '../../../../../services/supabaseService';

interface UserLinkSectionProps {
    ownerId?: string;
    onOwnerChange: (ownerId: string) => void;
    darkMode?: boolean;
}

const UserLinkSection: React.FC<UserLinkSectionProps> = ({ ownerId, onOwnerChange, darkMode = false }) => {
    const [docSearch, setDocSearch] = useState('');
    const [isSearchingUser, setIsSearchingUser] = useState(false);
    const [userFoundName, setUserFoundName] = useState<string | null>(null);
    const [searchMode, setSearchMode] = useState<'document' | 'name'>('document');
    const [searchResults, setSearchResults] = useState<Array<{ id: string, name: string, email: string, document?: string }>>([]);

    const handleSearchUser = async () => {
        if (!docSearch) return;
        setIsSearchingUser(true);
        setSearchResults([]);

        try {
            if (searchMode === 'document') {
                const user = await getUserByDocument(docSearch);
                if (user) {
                    onOwnerChange(user.id);
                    setUserFoundName(user.name);
                    alert(`Usuário encontrado: ${user.name} (${user.email})`);
                } else {
                    alert('Nenhum usuário encontrado com este documento (CPF/CNPJ).');
                    setUserFoundName(null);
                }
            } else {
                const users = await getUserByName(docSearch);
                if (users.length > 0) {
                    setSearchResults(users);
                } else {
                    alert('Nenhum usuário encontrado com este nome.');
                    setSearchResults([]);
                }
            }
        } catch (e) {
            alert('Erro ao buscar usuário.');
        } finally {
            setIsSearchingUser(false);
        }
    };

    const handleSelectUser = (user: { id: string, name: string, email: string }) => {
        onOwnerChange(user.id);
        setUserFoundName(user.name);
        setSearchResults([]);
        setDocSearch('');
    };

    const handleUnlink = () => {
        onOwnerChange('');
        setUserFoundName(null);
    };

    const baseInputClass = "w-full rounded-lg px-4 py-3 text-sm font-medium outline-none border transition-all duration-200 focus:ring-2 focus:ring-red-500/20";
    const lightInputClass = "bg-white border-gray-200 text-gray-900 focus:border-red-500 placeholder-gray-400";
    const darkInputClass = "bg-[#1A1A1A] border-zinc-800 text-gray-100 focus:border-red-500 placeholder-zinc-600";
    const inputClass = `${baseInputClass} ${darkMode ? darkInputClass : lightInputClass}`;
    const labelClass = `block text-[10px] font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`;

    return (
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
            <label className={labelClass}>
                <i className="fas fa-user-tag mr-1"></i>
                Cliente Vinculado (Opcional)
            </label>

            {ownerId ? (
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${darkMode ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">
                        <i className="fas fa-user"></i>
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className={`text-xs font-bold truncate ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
                            {userFoundName || `ID: ${ownerId.substring(0, 8)}...`}
                        </p>
                        <p className={`text-[9px] ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            Cliente Vinculado
                        </p>
                    </div>
                    <button
                        onClick={handleUnlink}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        title="Desvincular"
                    >
                        <i className="fas fa-unlink"></i>
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Toggle de Modo de Busca */}
                    <div className={`grid grid-cols-2 gap-1 p-1 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'}`}>
                        <button
                            onClick={() => { setSearchMode('document'); setSearchResults([]); }}
                            className={`py-2 rounded-md text-[9px] font-black uppercase transition-all ${searchMode === 'document'
                                ? (darkMode ? 'bg-zinc-700 text-white shadow' : 'bg-gray-900 text-white shadow')
                                : (darkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-gray-900')
                                }`}
                        >
                            <i className="fas fa-id-card mr-1"></i> CPF/CNPJ
                        </button>
                        <button
                            onClick={() => { setSearchMode('name'); setSearchResults([]); }}
                            className={`py-2 rounded-md text-[9px] font-black uppercase transition-all ${searchMode === 'name'
                                ? (darkMode ? 'bg-zinc-700 text-white shadow' : 'bg-gray-900 text-white shadow')
                                : (darkMode ? 'text-zinc-500 hover:text-white' : 'text-gray-400 hover:text-gray-900')
                                }`}
                        >
                            <i className="fas fa-user mr-1"></i> Nome
                        </button>
                    </div>

                    {/* Campo de Busca */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={docSearch}
                            onChange={e => setDocSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearchUser()}
                            className={`${inputClass} flex-grow`}
                            placeholder={searchMode === 'document' ? 'Digite CPF ou CNPJ...' : 'Digite o nome...'}
                        />
                        <button
                            onClick={handleSearchUser}
                            disabled={isSearchingUser || !docSearch}
                            className="bg-zinc-800 text-white px-4 rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                        >
                            {isSearchingUser ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                        </button>
                    </div>

                    {/* Resultados da Busca por Nome */}
                    {searchResults.length > 0 && (
                        <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
                            <div className={`px-3 py-2 text-[9px] font-bold uppercase ${darkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-gray-50 text-gray-600'}`}>
                                {searchResults.length} usuário(s) encontrado(s)
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {searchResults.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSelectUser(user)}
                                        className={`w-full p-3 text-left border-b transition-colors ${darkMode
                                            ? 'border-zinc-800 hover:bg-zinc-900'
                                            : 'border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className={`text-xs font-bold truncate ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                    {user.name}
                                                </p>
                                                <p className={`text-[10px] truncate ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                                                    {user.email}
                                                </p>
                                                <p className={`text-[9px] font-mono ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>
                                                    ID: {user.id.substring(0, 8)}...
                                                </p>
                                            </div>
                                            <i className="fas fa-chevron-right text-xs text-gray-400"></i>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-[9px] text-gray-400">
                        {searchMode === 'document'
                            ? 'Vincule este banner/popup a um cliente específico (opcional).'
                            : 'Digite o nome do cliente para buscar. Você verá o ID de cada resultado.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserLinkSection;
