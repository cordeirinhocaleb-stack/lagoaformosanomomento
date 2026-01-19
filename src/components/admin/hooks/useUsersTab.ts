import { useState, useMemo, useEffect, useCallback } from 'react';
import { User, NewsItem, AdPricingConfig, SystemSettings } from '@/types';
import { logAction, getPendingTicketsUsers } from '@/services/supabaseService';

interface UseUsersTabProps {
    allUsers: User[];
    currentUser: User;
    onUpdateUser: (user: User) => void;
    onAddUser?: (user: User) => void;
    onDeleteUser?: (id: string) => void;
}

export const useUsersTab = ({
    allUsers,
    currentUser,
    onUpdateUser,
    onAddUser,
    onDeleteUser
}: UseUsersTabProps) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
    const [isCreating, setIsCreating] = useState(false);
    const [newUserPassword, setNewUserPassword] = useState('');
    const [pendingUsers, setPendingUsers] = useState<{ userId: string, userName: string, avatar: string, count: number }[]>([]);
    const [showTicketDropdown, setShowTicketDropdown] = useState(false);
    const [showTicketsModal, setShowTicketsModal] = useState(false);

    const loadPendingTickets = useCallback(async () => {
        const users = await getPendingTicketsUsers();
        setPendingUsers(users);
    }, []);

    useEffect(() => {
        loadPendingTickets();
        const interval = setInterval(loadPendingTickets, 30000);
        return () => clearInterval(interval);
    }, [loadPendingTickets]);

    const totalPending = pendingUsers.reduce((acc, u) => acc + u.count, 0);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearch.toLowerCase());
            const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
            return matchesSearch && matchesRole;
        });
    }, [allUsers, userSearch, userRoleFilter]);

    const handleTicketUserClick = useCallback((userId: string) => {
        const user = allUsers.find(u => u.id === userId);
        if (user) {
            setSelectedUser(user);
            setIsCreating(false);
            setShowTicketDropdown(false);
        } else {
            alert("Usuário não encontrado na lista carregada. Tente buscar pelo nome.");
        }
    }, [allUsers]);

    const handleCreateClick = useCallback(() => {
        const templateUser: User = {
            id: '', name: '', email: '', role: 'Repórter', status: 'active', avatar: '', permissions: {}
        };
        setSelectedUser(templateUser);
        setIsCreating(true);
        setNewUserPassword('');
    }, []);

    const handleSaveUser = useCallback(() => {
        if (!selectedUser) { return; }

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
    }, [selectedUser, isCreating, newUserPassword, onAddUser, onUpdateUser, currentUser]);

    const handleSavePermissions = useCallback((permissions: Record<string, boolean>) => {
        if (selectedUser) {
            const updatedUser = { ...selectedUser, permissions };
            onUpdateUser(updatedUser);
            logAction(currentUser.id, currentUser.name, 'update_permissions', selectedUser.id, `Alterou permissões de: ${selectedUser.name}`);
            setTimeout(() => alert("Permissões alteradas com sucesso"), 50);
        }
    }, [selectedUser, onUpdateUser, currentUser]);

    const handleToggleStatus = useCallback(() => {
        if (!selectedUser) { return; }
        const newStatus = selectedUser.status === 'active' ? 'suspended' : 'active';
        const updated = { ...selectedUser, status: newStatus };
        onUpdateUser(updated);
        setSelectedUser(updated);
        logAction(currentUser.id, currentUser.name, 'change_user_status', selectedUser.id, `Alterou status para: ${newStatus}`);
    }, [selectedUser, onUpdateUser, currentUser]);

    const handleDeleteUser = useCallback(() => {
        if (!selectedUser) { return; }
        if (selectedUser.role === 'Desenvolvedor') {
            alert("Não é possível excluir um desenvolvedor do sistema.");
            return;
        }

        if (confirm(`TEM CERTEZA? Esta ação irá remover permanentemente o usuário ${selectedUser.name} e todos os seus dados vinculados. Esta ação NÃO PODE ser desfeita.`)) {
            if (onDeleteUser) {
                onDeleteUser(selectedUser.id);
                logAction(currentUser.id, currentUser.name, 'delete_user', selectedUser.id, `Excluiu o usuário permanentemente: ${selectedUser.name}`);
                setSelectedUser(null);
                alert("Usuário removido com sucesso!");
            }
        }
    }, [selectedUser, onDeleteUser, currentUser]);

    return {
        states: {
            selectedUser,
            setSelectedUser,
            userSearch,
            setUserSearch,
            userRoleFilter,
            setUserRoleFilter,
            isCreating,
            setIsCreating,
            newUserPassword,
            setNewUserPassword,
            pendingUsers,
            showTicketDropdown,
            setShowTicketDropdown,
            showTicketsModal,
            setShowTicketsModal,
            totalPending,
            filteredUsers
        },
        actions: {
            handleTicketUserClick,
            handleCreateClick,
            handleSaveUser,
            handleSavePermissions,
            handleToggleStatus,
            handleDeleteUser
        }
    };
};
