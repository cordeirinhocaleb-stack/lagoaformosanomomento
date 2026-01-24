'use client';

import React, { useEffect } from 'react';
import { useAppControllerContext } from '@/providers/AppControllerProvider';
import Admin from '@/components/admin/AdminMain';
import LoadingScreen from '@/components/common/LoadingScreen';
import AccessDeniedModal from '@/components/common/AccessDeniedModal';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { createNews, updateNews, deleteNews, createUser, updateUser, deleteUser, upsertAdvertiser, deleteAdvertiser } from '@/services/supabaseService';

export default function AdminPage() {
    const ctrl = useAppControllerContext();
    const { modals } = ctrl;

    // Redirecionamento se for Leitor (Não Admin)
    useEffect(() => {
        if (ctrl.isInitialized && ctrl.user && ctrl.user.role === 'Leitor') {
            ctrl.updateHash('/');
        }
    }, [ctrl.isInitialized, ctrl.user, ctrl.updateHash]);

    if (!ctrl.isInitialized || ctrl.showLoading) {
        return <LoadingScreen onFinished={() => { }} />;
    }

    if (!ctrl.user || ctrl.user.role === 'Leitor') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950">
                <AccessDeniedModal
                    visible={true}
                    onClose={() => ctrl.updateHash('/')}
                    onHomeClick={() => ctrl.updateHash('/')}
                    title="ACESSO RESTRITO"
                    message="Você não tem permissão para acessar a área administrativa. Entre com uma conta autorizada."
                />
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            <Admin
                user={ctrl.user}
                newsHistory={ctrl.news}
                allUsers={ctrl.users}
                advertisers={ctrl.advertisers}
                adConfig={ctrl.adConfig}
                systemSettings={ctrl.systemSettings}
                jobs={ctrl.systemJobs}
                auditLogs={ctrl.auditLogs}
                onAddNews={async (n) => { ctrl.setNews(p => [n, ...p]); await createNews(n); }}
                onUpdateNews={async (n) => { ctrl.setNews(p => p.map(x => x.id === n.id ? n : x)); await updateNews(n); }}
                onDeleteNews={async (id) => { ctrl.setNews(p => p.filter(x => x.id !== id)); await deleteNews(id); }}
                onAddUser={async (u) => { ctrl.setUsers(p => [...p, u]); await createUser(u); }}
                onUpdateUser={ctrl.handleProfileUpdate}
                onDeleteUser={async (id) => { ctrl.setUsers(p => p.filter(x => x.id !== id)); await deleteUser(id); }}
                onUpdateAdvertiser={async (a) => {
                    const updated = await upsertAdvertiser(a);
                    if (updated) {
                        ctrl.setAdvertisers(p => {
                            const exists = p.find(x => x.id === a.id);
                            if (exists) return p.map(x => x.id === a.id ? updated : x);
                            return [updated, ...p];
                        });
                    }
                    return updated;
                }}
                onDeleteAdvertiser={async (id) => {
                    ctrl.setAdvertisers(p => p.filter(x => x.id !== id));
                    await deleteAdvertiser(id);
                }}
                onUpdateAdConfig={ctrl.handleUpdateAdConfig}
                onUpdateSystemSettings={ctrl.handleUpdateSystemSettings}
                onLogout={ctrl.handleLogout}
                onNavigateHome={() => ctrl.updateHash('/')}
                initialNewsToEdit={ctrl.adminNewsToEdit}
            />
        </GoogleOAuthProvider>
    );
}
