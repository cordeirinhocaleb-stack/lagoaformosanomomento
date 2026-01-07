import React, { useState, useEffect } from 'react';
import { getSupabase } from '../../services/supabaseService';
import { User } from '../../types';
import UserFilterBar from './users/UserFilterBar';
import UserListTable from './users/UserListTable';
import UserEditModal from './users/UserEditModal';

interface UserManagerProps {
    currentUser: User;
}

const UserManager: React.FC<UserManagerProps> = ({ currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const supabase = getSupabase();
            if (!supabase) {throw new Error("Supabase não inicializado");}

            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {throw error;}
            setUsers(data || []);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            alert("Erro ao carregar lista de usuários.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedUser(null);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        try {
            const supabase = getSupabase();
            if (!supabase) {throw new Error("Supabase não inicializado");}

            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (error) {throw error;}

            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            alert("Falha ao deletar usuário.");
        }
    };

    const handleSave = async (userId: string | undefined, data: Partial<User>) => {
        const supabase = getSupabase();
        if (!supabase) {throw new Error("Supabase não inicializado");}

        try {
            if (userId) {
                // Update
                const { error } = await supabase
                    .from('users')
                    .update(data)
                    .eq('id', userId);

                if (error) {throw error;}

                setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
            } else {
                // Create (Note: normally handled via Auth, but admin might add pre-records or ghost users)
                // For Supabase, creating a user usually requires auth.api.createUser (admin only) 
                // or just inserting into users table if it's separate from auth.users (which implies manual management).
                // Assuming simple insert for now based on legacy logic.
                const { data: newUser, error } = await supabase
                    .from('users')
                    .insert([data])
                    .select()
                    .single();

                if (error) {throw error;}
                setUsers(prev => [newUser, ...prev]);
            }
        } catch (error) {
            console.error("Erro na operação de usuário:", error);
            throw error;
        }
    };

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
            />

            <UserListTable
                users={filteredUsers}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUserLevel={currentUser.role}
            />

            <UserEditModal
                user={selectedUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
            />
        </div>
    );
};

export default UserManager;
