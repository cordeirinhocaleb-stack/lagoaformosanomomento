
import React from 'react';
import { User } from '../../../types';

interface UserListProps {
    users: User[];
    onSelectUser: (user: User) => void;
    darkMode?: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, onSelectUser, darkMode = false }) => {
    return (
        <div className="w-full">

            {/* --- DESKTOP VIEW (TABLE) --- */}
            <div className={`hidden md:block rounded-[2.5rem] border shadow-sm overflow-hidden w-full transition-colors ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
                <table className="w-full text-left">
                    <thead className={`border-b ${darkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Usuário</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Perfil / Cargo</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">E-mail / Ativação</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status Geral</th>
                            <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-white/5' : 'divide-gray-50'}`}>
                        {users.map(u => (
                            <tr key={u.id} className={`transition-colors group cursor-pointer ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`} onClick={() => onSelectUser(u)}>
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded-full overflow-hidden border-2 shadow-sm flex items-center justify-center font-black ${darkMode ? 'bg-white/10 border-black/20 text-gray-400' : 'bg-gray-200 border-white text-gray-500'}`}>
                                                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                            </div>
                                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${u.isVerified ? 'bg-blue-500' : 'bg-amber-500 animate-pulse'} ${darkMode ? 'border-zinc-900' : 'border-white'}`}></div>
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.name}</p>
                                            <p className="text-[10px] text-gray-400 mt-1">ID: {u.id?.substring(0, 6) || 'N/A'}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase mb-1 inline-block ${u.role === 'Anunciante' ? 'bg-yellow-100 text-yellow-800' :
                                        u.role === 'Desenvolvedor' ? (darkMode ? 'bg-white text-black' : 'bg-zinc-900 text-white') :
                                            (darkMode ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600')
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <p className="text-[11px] font-bold text-gray-600 mb-1">{u.email}</p>
                                    <div className={`inline-flex items-center gap-1.5 ${u.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                        <i className={`fas ${u.isVerified ? 'fa-check-circle' : 'fa-clock'} text-[9px]`}></i>
                                        <span className="text-[9px] font-black uppercase tracking-tighter">
                                            {u.isVerified ? 'Confirmado' : 'Pendente'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${u.status === 'active' ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                                        {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    <button className={`w-8 h-8 rounded-full transition-colors flex items-center justify-center active:scale-90 shadow-sm border ${darkMode ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white hover:text-black' : 'bg-gray-100 border-gray-200 hover:bg-black hover:text-white'}`}>
                                        <i className="fas fa-cog text-xs"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MOBILE VIEW (CARDS) --- */}
            <div className="md:hidden space-y-3">
                {users.map(u => (
                    <div
                        key={u.id}
                        onClick={() => onSelectUser(u)}
                        className={`rounded-[1.5rem] p-5 border shadow-sm relative overflow-hidden active:scale-[0.98] transition-transform ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}
                    >
                        {/* Faixa de Status Lateral */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                        <div className="flex justify-between items-start pl-2 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-md flex items-center justify-center font-black text-lg ${darkMode ? 'bg-white/10 border-black/20 text-gray-400' : 'bg-gray-100 border-white text-gray-400'}`}>
                                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 flex items-center justify-center text-[8px] ${u.isVerified ? 'bg-blue-500 text-white' : 'bg-amber-400 text-black'} ${darkMode ? 'border-zinc-900' : 'border-white'}`}>
                                        <i className={`fas ${u.isVerified ? 'fa-check' : 'fa-exclamation'}`}></i>
                                    </div>
                                </div>
                                <div>
                                    <h4 className={`font-black text-base leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{u.name}</h4>
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${u.role === 'Anunciante' ? 'bg-yellow-50 text-yellow-700' :
                                        u.role === 'Desenvolvedor' ? (darkMode ? 'bg-white text-black' : 'bg-black text-white') :
                                            (darkMode ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500')
                                        }`}>
                                        {u.role}
                                    </span>
                                </div>
                            </div>
                            <button className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${darkMode ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                <i className="fas fa-chevron-right text-xs"></i>
                            </button>
                        </div>

                        <div className="pl-3 pt-3 border-t border-gray-50 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gray-500">
                                <i className="fas fa-envelope text-[10px] w-4 text-center"></i>
                                <span className="text-xs font-medium truncate">{u.email}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <i className="fas fa-id-badge text-[10px] w-4 text-center"></i>
                                    <span className="text-[10px] font-mono">ID: {u.id?.substring(0, 8) || 'N/A'}</span>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {u.status === 'active' ? '● Acesso Liberado' : '● Acesso Bloqueado'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default UserList;
