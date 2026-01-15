import React from 'react';
import { User, UserRole } from '@/types';

interface UserListTableProps {
    users: User[];
    loading: boolean;
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
    currentUserLevel: string;
}

const UserListTable: React.FC<UserListTableProps> = ({ users, loading, onEdit, onDelete, currentUserLevel }) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <i className="fas fa-circle-notch fa-spin text-2xl text-gray-300"></i>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                    <i className="fas fa-users-slash text-2xl"></i>
                </div>
                <h3 className="text-gray-900 font-bold">Nenhum usuário encontrado</h3>
                <p className="text-xs text-gray-500 mt-1">Tente ajustar os filtros de busca.</p>
            </div>
        );
    }

    const getRoleBadge = (role: string) => {
        const styles: Record<string, string> = {
            'Desenvolvedor': 'bg-red-50 text-red-600 border-red-100',
            'Anunciante': 'bg-purple-50 text-purple-600 border-purple-100',
            'Repórter': 'bg-blue-50 text-blue-600 border-blue-100',
            'Leitor': 'bg-gray-50 text-gray-600 border-gray-100'
        };
        const style = styles[role] || styles['user'];
        return (
            <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${style}`}>
                {role}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest pl-6">Usuário</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Contato</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Função</th>
                            <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right pr-6">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <i className="fas fa-user text-gray-400"></i>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors cursor-pointer" onClick={() => onEdit(user)}>
                                                {user.name || 'Sem Nome'}
                                            </p>
                                            <p className="text-[10px] text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-gray-600 font-medium flex items-center gap-2">
                                            <i className="fas fa-envelope text-gray-300 text-[10px]"></i> {user.email}
                                        </span>
                                        {user.phone && (
                                            <span className="text-xs text-gray-500 flex items-center gap-2">
                                                <i className="fas fa-phone text-gray-300 text-[10px]"></i> {user.phone}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    {getRoleBadge(user.role)}
                                </td>
                                <td className="p-4 text-right pr-6">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(user)}
                                            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                            title="Editar Usuário"
                                        >
                                            <i className="fas fa-pen text-xs"></i>
                                        </button>

                                        {(currentUserLevel === 'admin' && user.role !== 'Desenvolvedor') && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
                                                        onDelete(user.id);
                                                    }
                                                }}
                                                className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                                                title="Excluir Usuário"
                                            >
                                                <i className="fas fa-trash text-xs"></i>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserListTable;
