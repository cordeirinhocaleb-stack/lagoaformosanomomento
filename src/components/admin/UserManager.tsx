import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../services/supabaseService';
import { User, AdPricingConfig, SystemSettings } from '../../types';
import UserFilterBar from './users/UserFilterBar';
import UserListTable from './users/UserListTable';
import UserDetailModal from './users/UserDetailModal';
import { mapDbToUser, updateUser } from '../../services/users/userService';

interface UserManagerProps {
    currentUser: User;
    darkMode?: boolean;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser, darkMode = true }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [newUserPassword, setNewUserPassword] = useState<string>();
    const [adConfig, setAdConfig] = useState<AdPricingConfig>();
    const [systemSettings, setSystemSettings] = useState<SystemSettings>();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const loadConfigs = async () => {
            const supabase = getSupabase();
            if (!supabase) return;

            // Carregar adConfig
            const { data: adData } = await supabase
                .from('ad_pricing_config')
                .select('*')
                .single();
            if (adData) setAdConfig(adData as AdPricingConfig);

            // Carregar systemSettings
            const { data: settingsData } = await supabase
                .from('system_settings')
                .select('*')
                .single();
            if (settingsData) setSystemSettings(settingsData as SystemSettings);
        };
        loadConfigs();
    }, []);
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) { throw new Error("Supabase não inicializado"); }

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) { throw error; }

            // Map raw DB data to User objects
            const mappedUsers = (data || [])
                .map(mapDbToUser)
                .filter((u): u is User => u !== null);

            setUsers(mappedUsers);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            alert("Erro ao carregar lista de usuários.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsCreating(false);
        setIsEditModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsCreating(true);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        try {
            const supabase = getSupabase();
            if (!supabase) { throw new Error("Supabase não inicializado"); }

            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (error) { throw error; }

            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            alert("Falha ao deletar usuário.");
        }
    };

    const handleSave = async (userId: string | null, data: Partial<User>) => {
        const supabase = getSupabase();
        if (!supabase) return;

        try {
            if (userId) {
                // Update existing user using the service function
                await updateUser({ id: userId, ...data } as User);
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
            } else {
                // Create new user
                const { data: newUser, error } = await supabase
                    .from('users')
                    .insert([data])
                    .select()
                    .single();

                if (error) { throw error; }
                setUsers(prev => [newUser, ...prev]);
            }
        } catch (error) {
            console.error("Erro na operação de usuário:", error);
            throw error;
        }
    };

    // New handlers for UserDetailModal
    const handleUpdateUserLocal = (updates: Partial<User>) => {
        if (selectedUser) {
            setSelectedUser({ ...selectedUser, ...updates });
        }
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        try {
            await handleSave(selectedUser.id, selectedUser);
            setIsEditModalOpen(false);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Erro ao salvar usuário:", error);
            alert("Erro ao salvar usuário.");
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedUser) return;
        const newStatus = selectedUser.status === 'active' ? 'inactive' : 'active';
        try {
            await handleSave(selectedUser.id, { status: newStatus });
            setSelectedUser({ ...selectedUser, status: newStatus });
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Erro ao alternar status:", error);
            alert("Erro ao alternar status.");
        }
    };

    const handleUpdatePassword = (password: string) => {
        setNewUserPassword(password);
    };

    const handleSavePermissions = async (permissions: Record<string, boolean>) => {
        if (!selectedUser) return;
        try {
            await handleSave(selectedUser.id, { permissions });
            setSelectedUser({ ...selectedUser, permissions });
        } catch (error) {
            console.error("Erro ao salvar permissões:", error);
            alert("Erro ao salvar permissões.");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        if (!confirm(`Tem certeza que deseja deletar ${selectedUser.name}?`)) return;
        try {
            await handleDelete(selectedUser.id);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
        }
    };

    const createEmptyUser = (): User => ({
        id: '',
        name: '',
        email: '',
        role: 'Leitor',
        status: 'active',
        isVerified: false,
        permissions: {}
    });

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-fadeIn">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">Gerenciar <span className="text-red-600">Usuários</span></h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Total de {users.length} usuários cadastrados
                    </p>
                </div>
                {/* 
                <button 
                    onClick={handleCreate}
                    className="bg-black text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                >
                    <i className="fas fa-plus"></i> Novo Usuário
                </button>
                */}
            </header>

            <UserFilterBar
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                darkMode={darkMode}
            />

            <UserListTable
                users={filteredUsers}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUserLevel={currentUser.role}
                darkMode={darkMode}
            />

            {selectedUser && isEditModalOpen && (
                <UserDetailModal
                    user={selectedUser}
                    currentUser={currentUser}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdateUserLocal={handleUpdateUserLocal}
                    onSaveUser={handleSaveUser}
                    onToggleStatus={handleToggleStatus}
                    onUpdatePassword={handleUpdatePassword}
                    newUserPassword={newUserPassword}
                    isCreating={isCreating}
                    adConfig={adConfig}
                    onSavePermissions={handleSavePermissions}
                    onDeleteUser={handleDeleteUser}
                    systemSettings={systemSettings}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
};

export default UserManager;
