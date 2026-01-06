
import React, { useState, useMemo } from 'react';
import { User, NewsItem, AdPricingConfig, SystemSettings } from '../../types';
import { logAction, getPendingTicketsUsers } from '../../services/supabaseService';
import UserFilters from './users/UserFilters';
import UserList from './users/UserList';
import TicketsModal from './users/TicketsModal';
import UserDetailModal from './users/UserDetailModal';

interface UsersTabProps {
    allUsers: User[];
    newsHistory: NewsItem[];
    currentUser: User;
    onUpdateUser: (user: User) => void;
    onAddUser?: (user: User) => void;
    adConfig?: AdPricingConfig;
    systemSettings?: SystemSettings;
}

const UsersTab: React.FC<UsersTabProps> = ({ allUsers, newsHistory, currentUser, onUpdateUser, onAddUser, adConfig, systemSettings }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
    const [isCreating, setIsCreating] = useState(false);
    const [newUserPassword, setNewUserPassword] = useState('');
    const [pendingUsers, setPendingUsers] = useState<{ userId: string, userName: string, avatar: string, count: number }[]>([]);
    const [showTicketDropdown, setShowTicketDropdown] = useState(false);
    const [showTicketsModal, setShowTicketsModal] = useState(false);

    React.useEffect(() => {
        loadPendingTickets();
        const interval = setInterval(loadPendingTickets, 30000); // Atualiza a cada 30s
        return () => clearInterval(interval);
    }, []);

    const loadPendingTickets = async () => {
        const users = await getPendingTicketsUsers();
        setPendingUsers(users);
    };

    const totalPending = pendingUsers.reduce((acc, u) => acc + u.count, 0);

    const handleTicketUserClick = (userId: string) => {
        // Encontra usuário na lista atual da memória
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setIsCreating(false);
            setShowTicketDropdown(false);
        } else {
            // Se não estiver na lista (ex: paginação), idealmente buscaria do banco.
            // Para MVP, avisamos.
            alert("Usuário não encontrado na lista carregada. Tente buscar pelo nome.");
        }
    };

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
            const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
            return matchesSearch && matchesRole;
        });
    }, [allUsers, userSearch, userRoleFilter]);

    const handleCreateClick = () => {
        const templateUser: User = {
            id: '', name: '', email: '', role: 'Repórter', status: 'active', avatar: '', permissions: {}
        };
        setSelectedUser(templateUser);
        setIsCreating(true);
        setNewUserPassword('');
    };

    const handleSaveUser = () => {
        if (!selectedUser) return;

        if (isCreating) {
            if (!selectedUser.name || !selectedUser.email || !newUserPassword) {
                alert("Preencha todos os campos obrigatórios.");
                return;
            }
            if (selectedUser.role === 'Anunciante' && !selectedUser.advertiserPlan) {
                alert("Selecione um plano para o anunciante.");
                return;
            }

            const newUser = {
                ...selectedUser,
                id: Math.random().toString(36).substr(2, 9),
                password: newUserPassword,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            if (onAddUser) {
                onAddUser(newUser as User);
                logAction(currentUser.id, currentUser.name, 'create_user', newUser.id, `Criou o usuário: ${newUser.name}`);
                alert(`Usuário ${newUser.name} criado com sucesso!`);
                setSelectedUser(null);
                setIsCreating(false);
            }
        } else {
            onUpdateUser(selectedUser);
            logAction(currentUser.id, currentUser.name, 'update_user_profile', selectedUser.id, `Atualizou dados/plano de: ${selectedUser.name}`);
            alert("Dados e Plano atualizados com sucesso!");
        }
    };

    const handleSavePermissions = (permissions: Record<string, boolean>) => {
        if (selectedUser) {
            const updatedUser = { ...selectedUser, permissions };
            onUpdateUser(updatedUser);
            logAction(currentUser.id, currentUser.name, 'update_permissions', selectedUser.id, `Alterou permissões de: ${selectedUser.name}`);
            setTimeout(() => alert("Permissões alteradas com sucesso"), 50);
        }
    };

    const handleToggleStatus = () => {
        if (!selectedUser) return;
        const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
        const updated = { ...selectedUser, status: newStatus };
        onUpdateUser(updated);
        setSelectedUser(updated); // Update local state to reflect change immediately
        logAction(currentUser.id, currentUser.name, 'change_user_status', selectedUser.id, `Alterou status para: ${newStatus}`);
    };

    return (
        <div className="animate-fadeIn relative w-full h-full">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">GESTÃO DE <span className="text-red-600">EQUIPE</span></h1>
                    <div className="flex items-center gap-4">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Controle de acesso e auditoria</p>
                        {totalPending > 0 && (
                            <div className="relative">
                                <div
                                    onClick={() => setShowTicketDropdown(!showTicketDropdown)}
                                    className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse shadow-lg flex items-center gap-2 cursor-pointer hover:bg-red-700 transition-colors"
                                >
                                    <i className="fas fa-ticket-alt"></i>
                                    {totalPending} {totalPending === 1 ? 'Ticket Pendente' : 'Tickets Pendentes'}
                                </div>

                                {/* Dropdown de Tickets */}
                                {showTicketDropdown && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                            <p className="text-[9px] font-black uppercase text-gray-400">Usuários com tickets abertos</p>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {pendingUsers.map(pu => (
                                                <div
                                                    key={pu.userId}
                                                    onClick={() => handleTicketUserClick(pu.userId)}
                                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {pu.avatar ? <img src={pu.avatar} className="w-full h-full object-cover" /> : <i className="fas fa-user text-gray-400 text-xs"></i>}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-gray-900 truncate">{pu.userName}</p>
                                                        <p className="text-[9px] text-red-500 font-bold uppercase">{pu.count} {pu.count === 1 ? 'Ticket' : 'Tickets'}</p>
                                                    </div>
                                                    <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTicketsModal(true)}
                        className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors hover:border-red-500 hover:text-red-600"
                    >
                        <i className="fas fa-headset text-lg"></i> Chamados
                    </button>
                    <button
                        onClick={handleCreateClick}
                        className="bg-black text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
                    >
                        <i className="fas fa-plus"></i> Novo Membro
                    </button>
                </div>
            </header>

            <UserFilters
                searchTerm={userSearch}
                onSearchChange={setUserSearch}
                roleFilter={userRoleFilter}
                onRoleFilterChange={setUserRoleFilter}
            />

            <UserList
                users={filteredUsers}
                onSelectUser={(u) => { setSelectedUser(u); setIsCreating(false); }}
            />

            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    currentUser={currentUser} // Passado
                    isCreating={isCreating}
                    newUserPassword={newUserPassword}
                    adConfig={adConfig}
                    systemSettings={systemSettings}
                    onClose={() => setSelectedUser(null)}
                    onUpdateUserLocal={(updates) => setSelectedUser(prev => prev ? ({ ...prev, ...updates }) : null)}
                    onUpdatePassword={setNewUserPassword}
                    onSaveUser={handleSaveUser}
                    onToggleStatus={handleToggleStatus}
                    onSavePermissions={handleSavePermissions}
                />
            )}

            {showTicketsModal && (
                <TicketsModal
                    currentUser={currentUser}
                    onClose={() => setShowTicketsModal(false)}
                    onOpenProfile={(u) => setSelectedUser(u)}
                />
            )}
        </div>
    );
};

export default UsersTab;
