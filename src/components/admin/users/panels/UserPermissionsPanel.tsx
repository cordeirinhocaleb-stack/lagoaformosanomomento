import React, { useState } from 'react';
import { PERMISSION_SCHEMA } from '../constants';

interface UserPermissionsPanelProps {
    permissions: Record<string, boolean>;
    userRole?: string;
    onTogglePermission: (key: string) => void;
    onSetPermissions?: (perms: Record<string, boolean>) => void;
    onSave: () => void;
    darkMode?: boolean;
}

const UserPermissionsPanel: React.FC<UserPermissionsPanelProps> = ({ permissions, userRole, onTogglePermission, onSetPermissions, onSave, darkMode = false }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleApplyPreset = (e: React.MouseEvent) => {
        e.preventDefault();

        if (!userRole || !onSetPermissions) return;

        // Normalização robusta: lowercase, remove acentos, remove caracteres não-alfabéticos
        const normalize = (s: string) => s.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");

        const roleKey = normalize(userRole);

        // Mapa com chaves normalizadas
        const presets: Record<string, string[]> = {
            'admin': ['editorial_view', 'editorial_edit', 'editorial_delete', 'financial_view', 'financial_edit', 'plans_edit', 'user_plan_edit', 'users_view', 'users_edit', 'settings_edit', 'logs_view'],
            'administrador': ['editorial_view', 'editorial_edit', 'editorial_delete', 'financial_view', 'financial_edit', 'plans_edit', 'user_plan_edit', 'users_view', 'users_edit', 'settings_edit', 'logs_view'],
            'desenvolvedor': ['editorial_view', 'editorial_edit', 'editorial_delete', 'financial_view', 'financial_edit', 'plans_edit', 'user_plan_edit', 'users_view', 'users_edit', 'settings_edit', 'logs_view'],
            'editorchefe': ['editorial_view', 'editorial_edit', 'editorial_delete', 'financial_view', 'users_view', 'logs_view'],
            'editor': ['editorial_view', 'editorial_edit'],
            'jornalista': ['editorial_view', 'editorial_edit'],
            'reporter': ['editorial_view', 'editorial_edit'],
            'estagiario': ['editorial_view'],
            'leitor': [],
            'anunciante': [],
            'empresa': [],
            'prestadordeservico': []
        };

        const targetKeys = presets[roleKey];

        if (!targetKeys) {
            // Tentativa de fallback parcial se contiver "admin"
            if (roleKey.includes('admin')) {
                // ... logic could act here, but alert is safer
            }
            alert(`Não foi encontrada uma predefinição para o cargo: "${userRole}" (chave: ${roleKey}). Configure as permissões manualmente.`);
            return;
        }

        // Aplicação direta sem confirm() para evitar bloqueios de navegador
        // Como o usuário ainda precisa "Salvar", é seguro.

        const newPerms: Record<string, boolean> = {};

        // Reseta tudo
        PERMISSION_SCHEMA.flatMap(g => g.actions).forEach(a => {
            newPerms[a.key] = false;
        });

        // Aplica as do cargo
        targetKeys.forEach(k => newPerms[k] = true);

        onSetPermissions(newPerms);
    };

    const handleSaveClick = () => {
        setIsSaving(true);
        onSave();
        // Feedback visual temporário (já que não temos promise da prop)
        // Isso garante que o usuário perceba o clique
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className={`border p-4 rounded-xl mb-4 flex flex-col md:flex-row items-center justify-between gap-4 ${darkMode ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-[10px] font-bold leading-relaxed ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <i className="fas fa-info-circle mr-1"></i> Configure o acesso granular do usuário. Se as permissões estiverem vazias, o usuário pode não conseguir acessar recursos esperados.
                </p>
                {userRole && onSetPermissions && (
                    <button
                        onClick={handleApplyPreset}
                        className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase rounded-lg transition-colors shadow-md flex items-center gap-2"
                    >
                        <i className="fas fa-sync-alt"></i> Redefinir para {userRole}
                    </button>
                )}
            </div>

            {PERMISSION_SCHEMA.map(group => (
                <div key={group.id} className={`rounded-2xl p-6 border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`text-xs font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <i className={`fas ${group.icon} text-gray-400`}></i>
                        {group.label}
                    </h3>
                    <div className="space-y-4">
                        {group.actions.map(action => (
                            <div key={action.key} className="flex items-center justify-between py-1">
                                <div className="flex flex-col pr-4 max-w-[85%]">
                                    <span className={`text-xs font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{action.label}</span>
                                    <span className={`text-[9px] leading-tight mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {(action as any).description}
                                    </span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={permissions[action.key] || false}
                                        onChange={() => onTogglePermission(action.key)}
                                    />
                                    <div className={`w-9 h-5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${darkMode ? 'bg-gray-700 peer-checked:bg-green-600' : 'bg-gray-200 peer-checked:bg-black'}`}></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className={`mt-8 pt-6 border-t flex justify-end ${darkMode ? 'border-white/5' : 'border-gray-200'}`}>
                <button
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg w-full md:w-auto flex items-center justify-center gap-2 ${darkMode ? 'bg-white text-black hover:bg-green-500 hover:text-white' : 'bg-black text-white hover:bg-green-600'} ${isSaving ? 'opacity-80 scale-95 cursor-wait' : ''}`}
                >
                    {isSaving ? (
                        <>
                            <i className="fas fa-circle-notch fa-spin text-sm"></i>
                            <span>Salvando...</span>
                        </>
                    ) : (
                        "Salvar Permissões"
                    )}
                </button>
            </div>
        </div>
    );
};

export default UserPermissionsPanel;
