
import React from 'react';
import { PERMISSION_SCHEMA } from '../constants';

interface UserPermissionsPanelProps {
    permissions: Record<string, boolean>;
    onTogglePermission: (key: string) => void;
    onSave: () => void;
    darkMode?: boolean;
}

const UserPermissionsPanel: React.FC<UserPermissionsPanelProps> = ({ permissions, onTogglePermission, onSave, darkMode = false }) => {
    return (
        <div className="space-y-6 animate-fadeIn pb-24">
            <div className={`border p-4 rounded-xl mb-4 ${darkMode ? 'bg-blue-900/20 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-[10px] font-bold leading-relaxed ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <i className="fas fa-info-circle mr-1"></i> Defina exatamente o que este usuário pode acessar no painel. Desenvolvedores têm acesso total automático.
                </p>
            </div>

            {PERMISSION_SCHEMA.map(group => (
                <div key={group.id} className={`rounded-2xl p-6 border ${darkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`text-xs font-black uppercase mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <i className={`fas ${group.icon} text-gray-400`}></i>
                        {group.label}
                    </h3>
                    <div className="space-y-4">
                        {group.actions.map(action => (
                            <div key={action.key} className="flex items-center justify-between">
                                <span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{action.label}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
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

            <div className={`absolute bottom-0 left-0 right-0 p-6 border-t shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20 flex justify-end rounded-b-[inherit] ${darkMode ? 'bg-[#0F0F0F] border-white/5' : 'bg-white border-gray-100'}`}>
                <button
                    onClick={onSave}
                    className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-colors shadow-lg w-full md:w-auto ${darkMode ? 'bg-white text-black hover:bg-green-500 hover:text-white' : 'bg-black text-white hover:bg-green-600'}`}
                >
                    Salvar Permissões
                </button>
            </div>
        </div>
    );
};

export default UserPermissionsPanel;
